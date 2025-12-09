<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/jwt.php";
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON", "raw" => $raw]);
    exit;
}

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if (!$email || !$password) {
    echo json_encode(["error" => "Missing email or password"]);
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
        if (!password_verify($password, $u["password"])) {
            echo json_encode(["error" => "Invalid login"]);
            exit;
        }

        // Create JWT (include name/email/role, expires in 1h)
        $payload = [
            "name"  => $u["name"] ?? "",
            "email" => $u["email"],
            "role"  => $u["role"] ?? "student",
            "exp"   => time() + 3600
        ];
        $token = jwt_encode($payload);

        echo json_encode([
            "success" => true,
            "token"   => $token,
            // include user (frontend expects data.user on verify)
            "user"    => ["name" => $payload["name"], "email" => $payload["email"], "role" => $payload["role"]],
            "role"    => $payload["role"]
        ]);
        exit;
    }
}

echo json_encode(["error" => "Invalid login"]);
