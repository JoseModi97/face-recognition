<?php
if (!isset($_SESSION['email'])) {
    header('Location: /');
    exit();
}

require __DIR__ . '/templates/dashboard.php';
