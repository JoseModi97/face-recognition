<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON']);
        exit;
    }

    if (isset($data['name']) && isset($data['email']) && isset($data['descriptors'])) {
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $descriptors = $data['descriptors'];

        if (empty($name) || empty($email) || empty($descriptors)) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing data']);
            exit;
        }

        if (count($descriptors) !== 5) {
            http_response_code(400);
            echo json_encode(['message' => 'Exactly 5 descriptors are required']);
            exit;
        }


        $filenameEmail = strtolower(trim($email));
        $filenameEmail = preg_replace('/[^a-z0-9-@.]/', '', $filenameEmail);


        $userData = [
            'name' => $name,
            'email' => $email,
            'descriptors' => $descriptors
        ];

        $file = 'users/' . $filenameEmail . '.json';

        if (file_exists($file)) {
            http_response_code(409);
            echo json_encode(['message' => 'User already exists']);
            exit;
        }

        if (file_put_contents($file, json_encode($userData, JSON_PRETTY_PRINT))) {
            http_response_code(200);
            echo json_encode(['message' => 'Registration successful']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to save user data']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
