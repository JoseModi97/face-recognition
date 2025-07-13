<?php
require_once __DIR__ . '/../src/User.php';

$user = new User();
$users = $user->getAll();

header('Content-Type: application/json');
echo json_encode($users);
