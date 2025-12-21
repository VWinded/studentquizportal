<?php
ob_start(); 
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json; charset=UTF-8");

/* ✅ MANUAL PHPMailer LOAD — MATCHES YOUR FOLDER */
require_once __DIR__ . "/vendor/PHPMailer/PHPMailer.php";
require_once __DIR__ . "/vendor/PHPMailer/SMTP.php";
require_once __DIR__ . "/vendor/PHPMailer/Exception.php";

use PHPMailer\PHPMailer\PHPMailer;

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data["email"] ?? "");

if (!$email) {
    echo json_encode(["error" => "Email required"]);
    ob_end_flush();
    exit;
}

$usersFile = __DIR__ . "/users.json";
$users = json_decode(file_get_contents($usersFile), true);

$otp = random_int(100000, 999999);
$userFound = false;

foreach ($users as &$u) {
    if (($u["email"] ?? "") === $email) {
        $u["otp"] = $otp;
        $u["otp_expiry"] = time() + 600;
        $userFound = true;
        break;
    }
}

if (!$userFound) {
    echo json_encode(["error" => "Email not found"]);
    ob_end_flush();
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

    // ⚠️ MUST be verified in Brevo
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
    ob_end_flush();
    exit;

} catch (Exception $e) {
    echo json_encode(["error" => "Mail failed"]);
    exit;
}
