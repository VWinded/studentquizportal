<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$file = __DIR__ . "/live_attempts.json";
$raw  = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

$data = json_decode(file_get_contents("php://input"), true);

$raw[] = [
    "user" => $data["user"],
    "email" => $data["email"],
    "platform" => $data["platform"],
    "score" => $data["score"],
    "date" => date("Y-m-d H:i")
];

file_put_contents($file, json_encode($raw, JSON_PRETTY_PRINT));

echo json_encode(["status" => "ok"]);
