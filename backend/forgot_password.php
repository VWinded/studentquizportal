<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

require_once __DIR__ . "/vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data["email"] ?? "");

if (!$email) {
  echo json_encode(["error" => "Email required"]);
  exit;
}

$usersFile = __DIR__ . "/users.json";
$users = json_decode(file_get_contents($usersFile), true);

$found = false;

foreach ($users as &$u) {
  if (($u["email"] ?? "") === $email) {
    $otp = random_int(100000, 999999);
    $u["otp"] = $otp;
    $u["otp_expiry"] = time() + 600;
    $found = true;
    break;
  }
}

if (!$found) {
  echo json_encode(["error" => "Email not found"]);
  exit;
}

file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = getenv("SMTP_HOST");
  $mail->SMTPAuth = true;
  $mail->Username = getenv("SMTP_USER");
  $mail->Password = getenv("SMTP_PASS");
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = (int) getenv("SMTP_PORT");

  // ⚠️ MUST be a verified Brevo sender
  $mail->setFrom("no-reply@studentquizportal.com", "Student Quiz Portal");
  $mail->addAddress($email);

  $mail->isHTML(true);
  $mail->Subject = "Password Reset OTP";
  $mail->Body = "
    <h3>Password Reset</h3>
    <p>Your OTP is:</p>
    <h2>$otp</h2>
    <p>Valid for 10 minutes.</p>
  ";

  $mail->send();
  echo json_encode(["success" => true]);
} catch (Exception $e) {
  echo json_encode(["error" => "Mail failed: " . $mail->ErrorInfo]);
}
