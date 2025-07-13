<?php
$users = [];
$files = glob('users/*.json');

foreach ($files as $file) {
    $userData = json_decode(file_get_contents($file), true);
    $users[] = $userData;
}

header('Content-Type: application/json');
echo json_encode($users);
?>
