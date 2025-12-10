<?php
require_once __DIR__ . "/cors.php";
date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

$file = "leaderboard.json";   // ← SAME FILE AS PRACTICE
$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$newRow = [
    "name"      => $data["name"],
    "score"     => (int)$data["score"],
    "total"     => (int)$data["total"],
    "category"  => $data["category"] ?? "General",
    "timeTaken" => $data["timeTaken"] ?? 0,
    "mode"      => "competition",
    "date"      => date("Y-m-d H:i")
];

$old = [];
if (file_exists($file)) {
    $old = json_decode(file_get_contents($file), true);
    if (!is_array($old)) $old = [];
}

array_unshift($old, $newRow);

// Sort : highest score → lowest time taken
usort($old, function($a, $b) {
    if ($b["score"] != $a["score"]) return $b["score"] - $a["score"];
    return ($a["timeTaken"] ?? 99999) - ($b["timeTaken"] ?? 99999);
});

file_put_contents($file, json_encode($old, JSON_PRETTY_PRINT));

echo json_encode(["success" => true, "saved" => $newRow]);
