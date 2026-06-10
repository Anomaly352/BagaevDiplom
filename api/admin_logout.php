<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$_SESSION = [];
session_destroy();

json_response(['success' => true, 'message' => 'Выход выполнен.']);
