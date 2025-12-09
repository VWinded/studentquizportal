<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/jwt.php";
header("Content-Type: application/json");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

$questionsFile = __DIR__ . "/questions.json";
$method = $_SERVER["REQUEST_METHOD"];

// GET → return all questions
if ($method === "GET") {
    echo file_exists($questionsFile)
        ? file_get_contents($questionsFile)
        : json_encode([]);
    exit;
}

// POST → Add new question (admin only)
$headers = getallheaders();
$auth = $headers["Authorization"] ?? "";

if (!$auth || stripos($auth, "Bearer ") !== 0) {
    echo json_encode(["error" => "No token"]);
    exit;
}

$token = trim(substr($auth, 7));
$check = jwt_decode($token);

if (!$check["valid"]) {
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$user = $check["payload"];
if (($user["role"] ?? "") !== "admin") {
    echo json_encode(["error" => "Access denied"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset(
    $data["question"],
    $data["options"],
    $data["answerIndex"],
    $data["category"],
    $data["difficulty"],
    $data["image"]
)) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$questions = file_exists($questionsFile)
    ? json_decode(file_get_contents($questionsFile), true)
    : [];

$data["id"] = count($questions) + 1;

$questions[] = $data;

file_put_contents($questionsFile, json_encode($questions, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
