<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

require_once __DIR__ . "/vendor/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/vendor/PHPMailer/SMTP.php";
require_once __DIR__ . "/vendor/PHPMailer/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data["email"] ?? "");

if (!$email) {
  echo json_encode(["error" => "Email is required"]);
  exit;
}

$usersFile = __DIR__ . "/users.json";
$users = json_decode(file_get_contents($usersFile), true);

foreach ($users as &$u) {
  if ($u["email"] === $email) {

    $token = bin2hex(random_bytes(16));
    $u["reset_token"] = $token;
    $u["reset_expiry"] = time() + 900; // 15 min

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

    $resetLink = "https://studentquizportal.netlify.app/reset-password?token=$token";

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = getenv("SMTP_HOST");
    $mail->SMTPAuth = true;
    $mail->Username = getenv("SMTP_USER");
    $mail->Password = getenv("SMTP_PASS");
    $mail->SMTPSecure = "tls";
    $mail->Port = getenv("SMTP_PORT");

    $mail->setFrom(getenv("SMTP_USER"), "Student Quiz Portal");
    $mail->addAddress($email);

    $mail->Subject = "Reset your password";
    $mail->Body = "Click this link to reset your password:\n\n$resetLink";

    $mail->send();

    echo json_encode(["success" => true]);
    exit;
  }
}

echo json_encode(["error" => "Email not found"]);
