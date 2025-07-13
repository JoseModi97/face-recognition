<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid JSON']);
        exit;
    }

    if (isset($data['email'])) {
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['message' => 'Email is required']);
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
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/css/uikit.min.css" />
    <style>
        .glow-border {
            box-shadow: 0 0 10px rgba(0, 112, 243, 0.8), 0 0 20px rgba(0, 112, 243, 0.6), 0 0 30px rgba(0, 112, 243, 0.4);
            animation: glow 1.5s infinite alternate;
        }
        @keyframes glow {
            from {
                box-shadow: 0 0 10px rgba(0, 112, 243, 0.8), 0 0 20px rgba(0, 112, 243, 0.6), 0 0 30px rgba(0, 112, 243, 0.4);
            }
            to {
                box-shadow: 0 0 20px rgba(0, 112, 243, 1), 0 0 30px rgba(0, 112, 243, 0.8), 0 0 40px rgba(0, 112, 243, 0.6);
            }
        }
        #webcam {
            display: block;
        }
    </style>
</head>
<body>
    <?php include 'loader.php'; ?>
    <div class="uk-container uk-container-xsmall uk-padding">
        <div class="uk-flex uk-flex-between uk-flex-middle">
            <h1 class="uk-heading-medium">Login via Face</h1>
            <button class="uk-button uk-button-primary" type="button" id="login-face" style="display: none;">Login via Face</button>
        </div>
        <div id="loader" class="uk-overlay-default uk-position-cover" style="display: none;">
            <div class="uk-position-center">
                <div uk-spinner="ratio: 3"></div>
            </div>
        </div>
        <div class="uk-margin" style="position: relative;">
            <video id="webcam" width="720" height="560" autoplay muted></video>
        </div>
        <div class="uk-margin">
            <a href="register.html" class="uk-button uk-button-default" style="display: none;">Register</a>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit-icons.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
    <script src="js/face.js"></script>
</body>
</html>
