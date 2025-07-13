<?php
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

    if (isset($data['email'])) {
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid email format']);
            exit;
        }

        $_SESSION['email'] = $email;

        http_response_code(200);
        echo json_encode(['message' => 'Login successful']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data']);
    }
    exit;
}

require __DIR__ . '/templates/login.php';
