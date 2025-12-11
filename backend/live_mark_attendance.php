<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");
date_default_timezone_set("Asia/Kolkata");

$file = __DIR__ . "/live_attempts.json";
$rows = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// ⭐ READ FORM-DATA (not JSON)
$user     = $_POST["user"] ?? "";
$email    = $_POST["email"] ?? "";
$platform = $_POST["platform"] ?? "";
$score    = $_POST["score"] ?? "";
$total    = $_POST["total"] ?? ""; 
$subject  = $_POST["subject"] ?? "";   // <-- ADDED
$proof    = $_FILES["proof"] ?? null;

// ⭐ VALIDATION
if ($user === "" || $email === "" || $platform === "" || $score === "" || $total === "" || $subject === "" || !$proof) {
    echo json_encode(["error" => "missing fields"]);
    exit;
}

// validate numeric score and total
if (!is_numeric($score) || !is_numeric($total) || (int)$total <= 0) {
    echo json_encode(["error" => "score and total must be numeric and total must be > 0"]);
    exit;
}

// ⭐ HANDLE PROOF FILE UPLOAD
$uploadDir = __DIR__ . "/uploads/live_proofs/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$ext = pathinfo($proof["name"], PATHINFO_EXTENSION);
$proofName = "proof_" . time() . "_" . rand(1000,9999) . "." . $ext;

move_uploaded_file($proof["tmp_name"], $uploadDir . $proofName);

// compute percent safely
$scoreInt = (int)$score;
$totalInt = (int)$total;
$percent = 0;
if ($totalInt > 0) {
    $percent = (int) round(($scoreInt / $totalInt) * 100);
}

// ⭐ ADD ATTEMPT
$rows[] = [
    "id"       => time(),
    "user"     => $user,
    "email"    => $email,
    "platform" => $platform,
    "score"    => $score,
    "total"    => $total,
    "percent"  => $percent,
    "subject"  => $subject,     // <-- ADDED
    "proof"    => $proofName,
    "status"   => "pending",
    "mode"     => "live",       // <-- IMPORTANT: mark this row as live
    "date"     => date("Y-m-d H:i")
];

file_put_contents($file, json_encode($rows, JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok"]);
