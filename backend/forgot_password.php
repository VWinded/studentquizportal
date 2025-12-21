<?php
error_reporting(0);
ini_set('display_errors', 0);

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
if (!file_exists($usersFile)) {
  echo json_encode(["error" => "User database not found"]);
  exit;
}

$users = json_decode(file_get_contents($usersFile), true);
if (!is_array($users)) $users = [];

foreach ($users as &$u) {
  if (($u["email"] ?? "") === $email) {

    $token = bin2hex(random_bytes(16));
    $u["reset_token"] = $token;
    $u["reset_expiry"] = time() + 900;

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

    $resetLink = "https://studentquizportal.netlify.app/reset-password?token=$token";

    try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = getenv("SMTP_HOST");
    $mail->SMTPAuth = true;
    $mail->Username = getenv("SMTP_USER");
    $mail->Password = getenv("SMTP_PASS");
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = (int) getenv("SMTP_PORT");

    $mail->setFrom(getenv("SMTP_USER"), "Student Quiz Portal");
    $mail->addAddress($email);

    $mail->Subject = "Reset your password";
    $mail->Body = "Click the link below to reset your password:\n\n$resetLink";

    $mail->send();

    echo json_encode(["success" => true]);
    exit;

} catch (Exception $e) {
    error_log("MAIL ERROR: " . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        "error" => "Email failed to send",
        "details" => $mail->ErrorInfo
    ]);
    exit;
}



    echo json_encode([
      "success" => true,
      "message" => "If the email exists, a reset link has been sent."
    ]);
    exit;
  }
}

echo json_encode([
  "success" => true,
  "message" => "If the email exists, a reset link has been sent."
]);
