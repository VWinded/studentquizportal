<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// Load files
$users     = file_exists("users.json")     ? json_decode(file_get_contents("users.json"), true)     : [];
$questions = file_exists("questions.json") ? json_decode(file_get_contents("questions.json"), true) : [];
$attempts  = file_exists("attempts.json")  ? json_decode(file_get_contents("attempts.json"), true)  : [];
$live      = file_exists("live_attempts.json") ? json_decode(file_get_contents("live_attempts.json"), true) : [];

// Safety
$users     = is_array($users)     ? $users     : [];
$questions = is_array($questions) ? $questions : [];
$attempts  = is_array($attempts)  ? $attempts  : [];
$live      = is_array($live)      ? $live      : [];

// ---------- APPROVED LIVE ----------
$approvedLive = array_filter($live, function ($x) {
    return isset($x["status"]) && $x["status"] === "approved";
});
$totalApprovedLive = count($approvedLive);

// ---------- MY ATTEMPTS ----------
$email = $_GET["email"] ?? null;
$myAttempts = 0;

if ($email) {

    // practice + competition + online
    foreach ($attempts as $a) {
        if (($a["email"] ?? null) === $email) {
            $myAttempts++;
        }
    }

    // approved live
    foreach ($approvedLive as $l) {
        if (($l["email"] ?? null) === $email) {
            $myAttempts++;
        }
    }
}

echo json_encode([
    "totalUsers"     => count($users),
    "totalQuestions" => count($questions),

    // ⭐ Admin total attempts (correct)
    "totalAttempts"  => count($attempts) + $totalApprovedLive,

    // ⭐ Student personal attempt count
    "myAttempts"     => $myAttempts
]);
