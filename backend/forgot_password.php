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
  echo json_encode(["error" => "Email required"]);
  exit;
}

$usersFile = __DIR__ . "/users.json";
$users = json_decode(file_get_contents($usersFile), true);

foreach ($users as &$u) {
  if (($u["email"] ?? "") === $email) {

    $otp = random_int(100000, 999999);
    $u["otp"] = $otp;
    $u["otp_expiry"] = time() + 600; // 10 minutes

    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

    $mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = getenv("SMTP_HOST");
$mail->SMTPAuth = true;
$mail->Username = getenv("SMTP_USER");
$mail->Password = getenv("SMTP_PASS");
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = (int) getenv("SMTP_PORT");

$mail->setFrom(
  "no-reply@studentquizportal.netlify.app",
  "Student Quiz Portal"
);
$mail->addAddress($email);

$mail->isHTML(true);
$mail->CharSet = "UTF-8";

$mail->Subject = "Password Reset – Student Quiz Portal";
$mail->Body = "
  <h3>Password Reset</h3>
  <p>Your OTP / reset info is below:</p>
  <p><b>$otp</b></p>
  <p>Valid for 10 minutes.</p>
";
  }
}

echo json_encode(["success" => true]);
