<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$users = file_exists("users.json") ? json_decode(file_get_contents("users.json"), true) : [];
$questions = file_exists("questions.json") ? json_decode(file_get_contents("questions.json"), true) : [];
$attempts = file_exists("attempts.json") ? json_decode(file_get_contents("attempts.json"), true) : [];

echo json_encode([
    "totalUsers" => count($users),
    "totalQuestions" => count($questions),
    "totalAttempts" => count($attempts)
]);
