<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = db()->query(
            "SELECT
                p.product_id,
                p.product_name,
                p.description,
                p.price,
                p.weight_grams,
                p.image_url,
                c.slug,
                COALESCE(GROUP_CONCAT(t.tag_name ORDER BY t.tag_name SEPARATOR ', '), '') AS tags
            FROM products p
            INNER JOIN categories c ON c.category_id = p.category_id
            LEFT JOIN product_tag_map ptm ON ptm.product_id = p.product_id
            LEFT JOIN product_tags t ON t.tag_id = ptm.tag_id
            WHERE p.is_active = TRUE AND c.is_active = TRUE
            GROUP BY p.product_id
            ORDER BY c.sort_order, p.product_name"
        );

        $products = array_map('product_row_to_api', $stmt->fetchAll());
        json_response(['success' => true, 'products' => $products]);
    }

    if ($method === 'POST') {
        require_admin();

        $name = trim((string) ($_POST['name'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? ''));
        $price = (float) ($_POST['price'] ?? 0);
        $weight = trim((string) ($_POST['weight'] ?? ''));
        $description = trim((string) ($_POST['description'] ?? ''));
        $tags = array_filter(array_map('trim', explode(',', (string) ($_POST['tags'] ?? ''))));
        $imageUrl = trim((string) ($_POST['image'] ?? ''));
        $uploadedImage = save_uploaded_product_image('imageFile');

        if ($name === '' || $category === '' || $price <= 0 || $description === '') {
            json_response(['success' => false, 'message' => 'Заполните название, категорию, цену и описание.'], 400);
        }

        preg_match('/\d+/', $weight, $weightMatch);
        $weightGrams = isset($weightMatch[0]) ? (int) $weightMatch[0] : null;

        $pdo = db();
        $pdo->beginTransaction();

        $categoryStmt = $pdo->prepare('SELECT category_id FROM categories WHERE slug = ?');
        $categoryStmt->execute([$category]);
        $categoryId = $categoryStmt->fetchColumn();

        if (!$categoryId) {
            $pdo->rollBack();
            json_response(['success' => false, 'message' => 'Категория не найдена.'], 400);
        }

        $productStmt = $pdo->prepare(
            'INSERT INTO products (category_id, product_name, description, price, weight_grams, image_url)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $productStmt->execute([
            $categoryId,
            $name,
            $description,
            $price,
            $weightGrams,
            $uploadedImage ?: $imageUrl,
        ]);

        $productId = (int) $pdo->lastInsertId();
        $tagSelect = $pdo->prepare('SELECT tag_id FROM product_tags WHERE tag_name = ?');
        $tagInsert = $pdo->prepare('INSERT INTO product_tags (tag_name) VALUES (?)');
        $mapInsert = $pdo->prepare('INSERT INTO product_tag_map (product_id, tag_id) VALUES (?, ?)');

        foreach ($tags as $tag) {
            $tagSelect->execute([$tag]);
            $tagId = $tagSelect->fetchColumn();

            if (!$tagId) {
                $tagInsert->execute([$tag]);
                $tagId = $pdo->lastInsertId();
            }

            $mapInsert->execute([$productId, $tagId]);
        }

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Позиция добавлена.', 'product_id' => $productId], 201);
    }

    if ($method === 'DELETE') {
        require_admin();

        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            json_response(['success' => false, 'message' => 'Не указан товар.'], 400);
        }

        $stmt = db()->prepare('UPDATE products SET is_active = FALSE WHERE product_id = ?');
        $stmt->execute([$id]);
        json_response(['success' => true, 'message' => 'Позиция скрыта из меню.']);
    }

    json_response(['success' => false, 'message' => 'Метод не поддерживается.'], 405);
} catch (Throwable $error) {
    json_response(['success' => false, 'message' => $error->getMessage()], 500);
}
