<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

require_once __DIR__ . "/vendor/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/vendor/PHPMailer/SMTP.php";
require_once __DIR__ . "/vendor/PHPMailer/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

    // Generate token
    $token = bin2hex(random_bytes(16));
    $u["reset_token"] = $token;
    $u["reset_expiry"] = time() + 900; // 15 minutes

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

      // IMPORTANT: Gmail requires SAME email here
      $mail->setFrom(getenv("SMTP_USER"), getenv("SMTP_USER"));
      $mail->addAddress($email);

      $mail->isHTML(true);
      $mail->CharSet = "UTF-8";

      $mail->Subject = "Password Reset – Student Quiz Portal";
      $mail->Body = "
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <p><a href='$resetLink'>$resetLink</a></p>
        <p>This link expires in 15 minutes.</p>
      ";

      if (!$mail->send()) {
        error_log("MAIL ERROR: " . $mail->ErrorInfo);
        echo json_encode(["error" => "Mail send failed"]);
        exit;
      }

      echo json_encode(["success" => true]);
      exit;

    } catch (Exception $e) {
      error_log("MAIL EXCEPTION: " . $e->getMessage());
      echo json_encode(["error" => "Email failed"]);
      exit;
    }
  }
}

// Security-safe response
echo json_encode([
  "success" => true,
  "message" => "If the email exists, a reset link has been sent."
]);
