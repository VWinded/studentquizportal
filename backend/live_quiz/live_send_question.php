<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$raw = json_decode(file_get_contents("php://input"), true);

$roomFile = __DIR__ . "/live_room_state.json";
$room = json_decode(file_get_contents($roomFile), true);

$room["status"] = "running";
$room["currentQuestion"] = $raw["question"];
$room["questionIndex"] = $raw["index"];

file_put_contents($roomFile, json_encode($room, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
