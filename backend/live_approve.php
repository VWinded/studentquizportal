<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$file = __DIR__ . "/live_attempts.json";
$rows = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

$input = json_decode(file_get_contents("php://input"), true);
$email = $input["email"] ?? null;
$date  = $input["date"] ?? null;

if (!$email || !$date) {
    echo json_encode(["error" => "missing fields"]);
    exit;
}

foreach ($rows as &$r) {
    if ($r["email"] === $email && $r["date"] === $date) {
        $r["status"] = "approved";
    }
}

file_put_contents($file, json_encode($rows, JSON_PRETTY_PRINT));

echo json_encode(["status" => "approved"]);
