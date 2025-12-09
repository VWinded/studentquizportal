<?php
require_once __DIR__ . "/cors.php";
date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

$file = __DIR__ . "/leaderboard.json";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!file_exists($file)) {
        echo json_encode([]);
        exit;
    }
    echo file_get_contents($file);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!isset($data["name"], $data["score"])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$lb = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($lb)) $lb = [];

// NEW FIELDS
$mode = $data["mode"] ?? "practice";
$timeTaken = $data["timeTaken"] ?? null;

$lb[] = [
    "name" => $data["name"],
    "score" => (int)$data["score"],
    "time" => date("Y-m-d H:i"),
    "mode" => $mode,
    "timeTaken" => $timeTaken
];

// SORTING: Competition OR Practice
usort($lb, function($a, $b) {

    if (($a["mode"] ?? "practice") === "competition" &&
        ($b["mode"] ?? "practice") === "competition") {

        if ($b["score"] !== $a["score"]) {
            return $b["score"] - $a["score"];
        }

        return ($a["timeTaken"] ?? 999999) - ($b["timeTaken"] ?? 999999);
    }

    return $b["score"] - $a["score"];
});

file_put_contents($file, json_encode($lb, JSON_PRETTY_PRINT));

echo json_encode(["success" => true, "leaderboard" => $lb]);
