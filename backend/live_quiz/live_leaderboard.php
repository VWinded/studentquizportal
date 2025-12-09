<?php
require_once __DIR__ . "/../cors.php";
header("Content-Type: application/json");

$room = $_GET["room"] ?? "";
if (!$room) {
    echo json_encode([]);
    exit;
}

$file = __DIR__ . "/live_state.json";

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

$all = json_decode(file_get_contents($file), true);

if (!isset($all[$room]["scores"])) {
    echo json_encode([]);
    exit;
}

$scores = $all[$room]["scores"];

$list = [];
foreach ($scores as $name => $score) {
    $list[] = [
        "name" => $name,
        "score" => $score
    ];
}

usort($list, function($a, $b) {
    return $b["score"] - $a["score"];
});

echo json_encode($list);
