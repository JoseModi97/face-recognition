<?php
session_start();

$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/' :
        require __DIR__ . '/templates/home.php';
        break;
    case '/login' :
        require __DIR__ . '/login.php';
        break;
    case '/register' :
        require __DIR__ . '/register.php';
        break;
    case '/dashboard' :
        require __DIR__ . '/dashboard.php';
        break;
    case '/logout' :
        require __DIR__ . '/logout.php';
        break;
    case '/api/users' :
        require __DIR__ . '/api/users.php';
        break;
    default:
        http_response_code(404);
        require __DIR__ . '/templates/404.php';
        break;
}
