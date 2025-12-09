<?php
require_once __DIR__ . "/cors.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON", "raw" => $raw]);
    exit;
}

$name     = trim($data["name"] ?? "");
$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (!$name || !$email || !$password) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$usersFile = __DIR__ . "/users.json";
$users = [];
if (file_exists($usersFile)) {
    $rawUsers = file_get_contents($usersFile);
    $users = json_decode($rawUsers, true);
    if (!is_array($users)) $users = [];
}

foreach ($users as $u) {
    if (($u["email"] ?? "") === $email) {
        echo json_encode(["error" => "Email already registered"]);
        exit;
    }
}

$users[] = [
    "name" => $name,
    "email" => $email,
    "password" => password_hash($password, PASSWORD_DEFAULT),
    "role" => "student"
];

file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo json_encode(["success" => true]);
