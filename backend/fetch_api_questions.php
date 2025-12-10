<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// Force curl availability
if (!function_exists("curl_init")) {
    echo json_encode(["error" => "CURL_NOT_ENABLED"]);
    exit;
}

function getAPI($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_TIMEOUT => 10,
    ]);
    $res = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err || !$res) {
        return null;
    }
    return json_decode($res, true);
}


// 1️⃣ Return categories
if (isset($_GET["get"]) && $_GET["get"] === "categories") {
    $data = getAPI("https://opentdb.com/api_category.php");
    if (!$data) {
        echo json_encode(["trivia_categories" => []]);
        exit;
    }
    echo json_encode($data);
    exit;
}


// 2️⃣ Fetch questions
$category  = $_GET["category"] ?? 0;
$difficulty = $_GET["difficulty"] ?? "easy";
$amount = $_GET["count"] ?? 10;

$url = "https://opentdb.com/api.php?amount=$amount&category=$category&difficulty=$difficulty&type=multiple";

$data = getAPI($url);

if (!$data || $data["response_code"] !== 0) {
    echo json_encode([]);
    exit;
}


// Convert format
$converted = [];

foreach ($data["results"] as $q) {

    $options = $q["incorrect_answers"];
    $correct = $q["correct_answer"];

    $answerIndex = rand(0, count($options));
    array_splice($options, $answerIndex, 0, $correct);

    $converted[] = [
        "question"    => html_entity_decode($q["question"]),
        "options"     => array_map("html_entity_decode", $options),
        "answerIndex" => $answerIndex,
        "category"    => html_entity_decode($q["category"]),
    ];
}

echo json_encode($converted);
