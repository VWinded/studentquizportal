<?php
require_once "cors.php";
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$file = __DIR__ . "/questions.json";

if (!file_exists($file)) {
    echo json_encode(["questions" => []]);
    exit;
}

$questions = json_decode(file_get_contents($file), true);
if (!is_array($questions)) $questions = [];

echo json_encode(["questions" => $questions]);
