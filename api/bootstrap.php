<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_admin(): void
{
    if (($_SESSION['admin_logged_in'] ?? false) !== true) {
        json_response(['success' => false, 'message' => 'Требуется вход администратора.'], 401);
    }
}

function product_row_to_api(array $row): array
{
    $tags = $row['tags'] ?? '';

    return [
        'id' => (int) $row['product_id'],
        'name' => $row['product_name'],
        'category' => $row['slug'],
        'price' => (int) $row['price'],
        'weight' => $row['weight_grams'] ? $row['weight_grams'] . ' г' : '',
        'tags' => $tags === '' ? [] : explode(', ', $tags),
        'description' => $row['description'],
        'image' => $row['image_url'] ?: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=80',
    ];
}

function save_uploaded_product_image(string $field): ?string
{
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        json_response(['success' => false, 'message' => 'Не удалось загрузить изображение.'], 400);
    }

    $tmpName = $_FILES[$field]['tmp_name'];
    $mime = mime_content_type($tmpName);
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    if (!isset($allowed[$mime])) {
        json_response(['success' => false, 'message' => 'Поддерживаются только JPG, PNG и WEBP.'], 400);
    }

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0775, true);
    }

    $filename = uniqid('product_', true) . '.' . $allowed[$mime];
    $target = UPLOAD_DIR . '/' . $filename;

    if (!move_uploaded_file($tmpName, $target)) {
        json_response(['success' => false, 'message' => 'Не удалось сохранить изображение.'], 500);
    }

    return UPLOAD_PUBLIC_PATH . '/' . $filename;
}
