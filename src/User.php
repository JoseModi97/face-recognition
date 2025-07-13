<?php
class User
{
    private $storage_path = __DIR__ . '/../users/';

    public function create($name, $email, $descriptors)
    {
        if (empty($name) || empty($email) || empty($descriptors)) {
            throw new Exception('Missing data');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format');
        }

        if (count($descriptors) !== 5) {
            throw new Exception('Exactly 5 descriptors are required');
        }

        $filenameEmail = strtolower(trim($email));
        $filenameEmail = preg_replace('/[^a-z0-9-@.]/', '', $filenameEmail);

        $file = $this->storage_path . $filenameEmail . '.json';

        if (file_exists($file)) {
            throw new Exception('User already exists');
        }

        $userData = [
            'name' => $name,
            'email' => $email,
            'descriptors' => $descriptors
        ];

        if (file_put_contents($file, json_encode($userData, JSON_PRETTY_PRINT))) {
            return true;
        } else {
            throw new Exception('Failed to save user data');
        }
    }

    public function getAll()
    {
        $users = [];
        $files = glob($this->storage_path . '*.json');

        foreach ($files as $file) {
            $userData = json_decode(file_get_contents($file), true);
            $users[] = $userData;
        }

        return $users;
    }
}
