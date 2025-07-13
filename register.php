<?php
require_once __DIR__ . '/src/User.php';

if (isset($_SESSION['email'])) {
    header('Location: /dashboard');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON']);
        exit;
    }

    try {
        $user = new User();
        $user->create(
            filter_var($data['name'], FILTER_SANITIZE_STRING),
            filter_var($data['email'], FILTER_SANITIZE_EMAIL),
            $data['descriptors']
        );
        http_response_code(200);
        echo json_encode(['message' => 'Registration successful']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['message' => $e->getMessage()]);
    }
    exit;
}

require __DIR__ . '/templates/register.php';
