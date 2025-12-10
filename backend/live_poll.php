<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$roomFile = __DIR__ . "/live_room_state.json";
$state = json_decode(file_get_contents($roomFile), true);

session_start();

$last_index = $_SESSION['last_q_index'] ?? -1;

// Host sent new question
if ($state["questionIndex"] != $last_index) {
    $_SESSION['last_q_index'] = $state["questionIndex"];

    echo json_encode([
        "type" => "question",
        "payload" => [
            "index" => $state["questionIndex"],
            "question" => $state["currentQuestion"]
        ]
    ]);
    exit;
}

// Host ended quiz
if ($state["status"] === "finished") {
    echo json_encode(["type" => "finish"]);
    exit;
}

// No update → ask again
echo json_encode(["type" => "none"]);
