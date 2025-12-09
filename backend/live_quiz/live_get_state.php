<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$room = json_decode(file_get_contents(__DIR__ . "/live_room_state.json"), true);
$scores = json_decode(file_get_contents(__DIR__ . "/live_scores.json"), true);

echo json_encode([
    "room" => $room,
    "scores" => $scores
]);
