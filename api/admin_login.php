<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $data = request_json();
    $email = trim((string) ($data['email'] ?? ''));
    $password = (string) ($data['password'] ?? '');

    if ($email !== 'admin@sakura.ru' || $password !== 'admin123') {
        json_response(['success' => false, 'message' => 'Неверный логин или пароль.'], 401);
    }

    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_email'] = $email;

    json_response(['success' => true, 'message' => 'Вход выполнен.']);
} catch (Throwable $error) {
    json_response(['success' => false, 'message' => $error->getMessage()], 500);
}
