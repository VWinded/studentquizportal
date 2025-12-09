<?php
require_once __DIR__ . "/cors.php";
date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

$file = __DIR__ . "/leaderboard_online.json";

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    if (!file_exists($file)) {
        echo json_encode([]);
        exit;
    }

    echo file_get_contents($file);
    exit;
}

// POST → Save score
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!isset($data["name"], $data["score"], $data["categoryName"], $data["difficulty"])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$lb = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($lb)) $lb = [];

$lb[] = [
    "name" => $data["name"],
    "score" => (int)$data["score"],
    "category" => $data["categoryName"],
    "difficulty" => $data["difficulty"],
    "time" => date("Y-m-d H:i")
];

// Sort by highest score
usort($lb, fn($a, $b) => $b["score"] - $a["score"]);

file_put_contents($file, json_encode($lb, JSON_PRETTY_PRINT));

echo json_encode(["success" => true, "leaderboard" => $lb]);
