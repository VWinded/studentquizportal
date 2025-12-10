<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$file = __DIR__ . "/live_attempts.json";
$rows = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// ⭐ READ FORM-DATA (not JSON)
$user     = $_POST["user"] ?? "";
$email    = $_POST["email"] ?? "";
$platform = $_POST["platform"] ?? "";
$score    = $_POST["score"] ?? "";
$proof    = $_FILES["proof"] ?? null;

// ⭐ VALIDATION
if ($user === "" || $email === "" || $platform === "" || $score === "" || !$proof) {
    echo json_encode(["error" => "missing fields"]);
    exit;
}

// ⭐ HANDLE PROOF FILE UPLOAD
$uploadDir = __DIR__ . "/uploads/live_proofs/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$ext = pathinfo($proof["name"], PATHINFO_EXTENSION);
$proofName = "proof_" . time() . "_" . rand(1000,9999) . "." . $ext;

move_uploaded_file($proof["tmp_name"], $uploadDir . $proofName);

// ⭐ ADD ATTEMPT
$rows[] = [
    "id"       => time(),
    "user"     => $user,
    "email"    => $email,
    "platform" => $platform,
    "score"    => $score,
    "proof"    => $proofName,
    "status"   => "pending",
    "date"     => date("Y-m-d H:i")
];

file_put_contents($file, json_encode($rows, JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok"]);
