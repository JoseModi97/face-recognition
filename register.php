<?php
session_start();

if (isset($_SESSION['email'])) {
    header('Location: dashboard.php');
    exit();
}

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
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/css/uikit.min.css" />
</head>
<body>
    <?php include 'loader.php'; ?>
    <div class="uk-container uk-container-xsmall uk-padding">
        <h1 class="uk-heading-medium">Register</h1>
        <form id="register-form">
            <div class="uk-margin">
                <input class="uk-input" type="text" id="name" placeholder="Name" required>
            </div>
            <div class="uk-margin">
                <input class="uk-input" type="email" id="email" placeholder="Email" required>
            </div>
            <div class="uk-margin">
                <video id="webcam" width="720" height="560" autoplay muted></video>
            </div>
            <div class="uk-margin">
                <button class="uk-button uk-button-primary" type="button" id="capture-face">Capture Face</button>
            </div>
            <div class="uk-margin">
                <div uk-form-custom="target: true">
                    <input type="file" id="image-upload" accept="image/*">
                    <input class="uk-input uk-form-width-medium" type="text" placeholder="Select file" disabled>
                </div>
                <button class="uk-button uk-button-default" type="button" id="upload-image">Upload Image</button>
            </div>
            <div class="uk-margin">
                <button class="uk-button uk-button-default" type="submit">Register</button>
            </div>
        </form>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit-icons.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    <script src="js/face.js"></script>
</body>
</html>
