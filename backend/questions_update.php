<?php
require_once __DIR__ . "/cors.php";

header("Content-Type: application/json");

// ===== READ DATA =====
$body = json_decode(file_get_contents("php://input"), true);

$id = $body["id"] ?? null;
if (!$id) {
    echo json_encode([
        "success" => false,
        "error"   => "ID missing"
    ]);
    exit;
}

$file = __DIR__ . "/questions.json";

// read questions list
$list = file_exists($file)
    ? json_decode(file_get_contents($file), true)
    : [];

if (!is_array($list)) {
    $list = [];
}

// only these fields are allowed to be updated
$allowed = ["question", "options", "answerIndex", "category", "difficulty", "image"];

$updated = false;

foreach ($list as &$q) {
    if ((int)$q["id"] === (int)$id) {

        // copy allowed fields from body into this question
        foreach ($allowed as $key) {
            if (array_key_exists($key, $body)) {
                $q[$key] = $body[$key];
            }
        }

        $updated = true;
        break;
    }
}

if (!$updated) {
    echo json_encode([
        "success" => false,
        "error"   => "Question not found"
    ]);
    exit;
}

// save back to JSON file
file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT));

echo json_encode([
    "success" => true
]);
