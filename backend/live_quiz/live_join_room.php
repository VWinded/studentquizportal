<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$room = json_decode(file_get_contents(__DIR__ . "/live_room_state.json"), true);

if (!$room || $room["status"] === "finished") {
    echo json_encode(["error" => "Room closed"]);
    exit;
}

echo json_encode([
    "success" => true,
    "room" => $room
]);
