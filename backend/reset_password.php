<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$token = $data["token"] ?? "";
$password = $data["password"] ?? "";

if (!$token || !$password) {
  echo json_encode(["error" => "Invalid request"]);
  exit;
}

$usersFile = __DIR__ . "/users.json";
if (!file_exists($usersFile)) {
  echo json_encode(["error" => "User database not found"]);
  exit;
}

$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) $users = [];

foreach ($users as &$u) {
  if (
    isset($u["reset_token"]) &&
    $u["reset_token"] === $token &&
    time() < ($u["reset_expiry"] ?? 0)
  ) {
    $u["password"] = password_hash($password, PASSWORD_DEFAULT);
    unset($u["reset_token"], $u["reset_expiry"]);

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    echo json_encode(["success" => true]);
    exit;
  }
}

echo json_encode(["error" => "Invalid or expired token"]);
