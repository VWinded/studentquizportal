<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$otp = trim($data["otp"] ?? "");
$password = $data["password"] ?? "";

if (!$email || !$otp || !$password) {
  echo json_encode(["error" => "Missing data"]);
  exit;
}

$usersFile = __DIR__ . "/users.json";
$users = json_decode(file_get_contents($usersFile), true);

foreach ($users as &$u) {
  if (
    ($u["email"] ?? "") === $email &&
    ($u["otp"] ?? "") == $otp &&
    time() < ($u["otp_expiry"] ?? 0)
  ) {
    $u["password"] = password_hash($password, PASSWORD_DEFAULT);
    unset($u["otp"], $u["otp_expiry"]);

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    echo json_encode(["success" => true]);
    exit;
  }
}

echo json_encode(["error" => "Invalid or expired OTP"]);
