<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$practice = file_exists("attempts.json") 
    ? json_decode(file_get_contents("attempts.json"), true) 
    : [];

$live = file_exists("live_attempts.json") 
    ? json_decode(file_get_contents("live_attempts.json"), true) 
    : [];

echo json_encode(array_merge($practice, $live));
