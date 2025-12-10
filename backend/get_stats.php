<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$users     = file_exists("users.json")     ? json_decode(file_get_contents("users.json"), true)     : [];
$questions = file_exists("questions.json") ? json_decode(file_get_contents("questions.json"), true) : [];
$attempts  = file_exists("attempts.json")  ? json_decode(file_get_contents("attempts.json"), true)  : [];

// ⭐ NEW — Live attempts
$live      = file_exists("live_attempts.json") 
    ? json_decode(file_get_contents("live_attempts.json"), true) 
    : [];

if (!is_array($users))     $users     = [];
if (!is_array($questions)) $questions = [];
if (!is_array($attempts))  $attempts  = [];
if (!is_array($live))      $live      = [];

// ⭐ OPTIONAL: per-user attempts (for Home / Dashboard)
$email = $_GET["email"] ?? null;
$myAttempts = 0;

if ($email) {

    // Practice / Competition / Online attempts
    foreach ($attempts as $a) {
        if (($a["email"] ?? null) === $email) {
            $myAttempts++;
        }
    }

    // ⭐ NEW — add live attempts
    foreach ($live as $l) {
        if (($l["email"] ?? null) === $email) {
            $myAttempts++;
        }
    }
}

echo json_encode([
    "totalUsers"     => count($users),
    "totalQuestions" => count($questions),

    // ⭐ NEW — include live attempts in total count
    "totalAttempts"  => count($attempts) + count($live),

    "myAttempts"     => $myAttempts
]);
