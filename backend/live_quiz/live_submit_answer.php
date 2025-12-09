<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$raw = json_decode(file_get_contents("php://input"), true);

$name = $raw["name"];
$correct = $raw["correct"];

$scoreFile = __DIR__ . "/live_scores.json";
$scores = json_decode(file_get_contents($scoreFile), true);

if (!isset($scores[$name])) {
    $scores[$name] = 0;
}

if ($correct) {
    $scores[$name] += 1;
}

file_put_contents($scoreFile, json_encode($scores, JSON_PRETTY_PRINT));

echo json_encode(["saved" => true]);
