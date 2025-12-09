<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// 1. If request is for categories
if (isset($_GET["get"]) && $_GET["get"] === "categories") {
    $cats = file_get_contents("https://opentdb.com/api_category.php");
    echo $cats;
    exit;
}

// 2. Fetch questions
$category  = $_GET["category"] ?? 0;
$difficulty = $_GET["difficulty"] ?? "easy";
$amount = $_GET["count"] ?? 10;

$url = "https://opentdb.com/api.php?amount={$amount}&category={$category}&difficulty={$difficulty}&type=multiple";

$response = file_get_contents($url);
$data = json_decode($response, true);

// Convert to your structured format
$converted = [];

foreach ($data["results"] as $q) {
    $options = $q["incorrect_answers"];
    $correct = $q["correct_answer"];

    // Insert correct answer into options
    $answerIndex = rand(0, count($options));
    array_splice($options, $answerIndex, 0, $correct);

    $converted[] = [
        "question" => html_entity_decode($q["question"]),
        "options" => array_map("html_entity_decode", $options),
        "answerIndex" => $answerIndex,
        "category" => html_entity_decode($q["category"])
    ];
}

echo json_encode($converted);
