<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['name']) && isset($data['email']) && isset($data['descriptors'])) {
        $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $descriptors = $data['descriptors'];

        $filenameEmail = strtolower(trim($email));
        $filenameEmail = preg_replace('/[^a-z0-9-@.]/', '', $filenameEmail);


        $userData = [
            'name' => $name,
            'email' => $email,
            'descriptors' => $descriptors
        ];

        $file = 'users/' . $filenameEmail . '.json';
        file_put_contents($file, json_encode($userData));

        http_response_code(200);
        echo json_encode(['message' => 'Registration successful']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
