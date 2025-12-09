<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$roomFile = __DIR__ . "/live_room_state.json";
$scoreFile = __DIR__ . "/live_scores.json";

// Reset old room
file_put_contents($roomFile, json_encode([
    "roomId" => rand(10000, 99999),
    "status" => "waiting", // waiting | running | finished
    "currentQuestion" => null,
    "questionIndex" => -1,
    "startTime" => time()
], JSON_PRETTY_PRINT));

// Reset scores
file_put_contents($scoreFile, json_encode([]));

echo json_encode([
    "success" => true,
    "roomId" => json_decode(file_get_contents($roomFile), true)["roomId"]
]);
