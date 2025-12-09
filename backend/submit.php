<?php
require_once __DIR__ . "/cors.php";
date_default_timezone_set("Asia/Kolkata");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

// Read JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// Validate incoming fields from Quiz.jsx
if (!isset($data["name"], $data["score"], $data["category"], $data["total"], $data["correct"])) {
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

/* -----------------------------------------------------
   ⭐ NEW FIELDS ADDED (without removing old logic)
------------------------------------------------------*/
$mode = $data["mode"] ?? "practice";           // "practice" or "competition"
$timeTaken = $data["timeTaken"] ?? null;       // seconds taken by user
if (!is_numeric($timeTaken)) $timeTaken = null;


/* -----------------------------------------------------
   1️⃣ SAVE LEADERBOARD (leaderboard.json)
   (Your old logic preserved — extended safely)
------------------------------------------------------*/
$lbFile = __DIR__ . "/leaderboard.json";
$lb = file_exists($lbFile) ? json_decode(file_get_contents($lbFile), true) : [];
if (!is_array($lb)) $lb = [];

// NEW: store mode + timeTaken
$lb[] = [
    "name" => $data["name"],
    "score" => (int)$data["score"],
    "time" => date("Y-m-d H:i"),
    "mode" => $mode,
    "timeTaken" => $timeTaken
];

// ⭐ NEW SORTING LOGIC:
// → Practice: Highest score first
// → Competition: Highest score first, lowest timeTaken wins
usort($lb, function($a, $b) {

    // If both are competition mode → sort by score DESC, then time ASC
    if (($a["mode"] ?? "practice") === "competition" &&
        ($b["mode"] ?? "practice") === "competition") {

        if ($b["score"] !== $a["score"]) {
            return $b["score"] - $a["score"];
        }

        return ($a["timeTaken"] ?? 999999) - ($b["timeTaken"] ?? 999999);
    }

    // Default (practice or mixed)
    return $b["score"] - $a["score"];
});

file_put_contents($lbFile, json_encode($lb, JSON_PRETTY_PRINT));


/* -----------------------------------------------------
   2️⃣ SAVE QUIZ ATTEMPT (attempts.json)
   (Your old logic intact)
------------------------------------------------------*/
$attemptFile = __DIR__ . "/attempts.json";

$attempts = file_exists($attemptFile)
    ? json_decode(file_get_contents($attemptFile), true)
    : [];

if (!is_array($attempts)) $attempts = [];

$percent = round(($data["correct"] / $data["total"]) * 100);

$attempts[] = [
    "correct"   => $data["correct"],
    "total"     => $data["total"],
    "percent"   => $percent,
    "category"  => $data["category"],
    "mode"      => $mode,          // ⭐ NEW
    "timeTaken" => $timeTaken,     // ⭐ NEW
    "date"      => date("Y-m-d H:i")
];

file_put_contents($attemptFile, json_encode($attempts, JSON_PRETTY_PRINT));


/* -----------------------------------------------------
   3️⃣ RETURN SUCCESS
------------------------------------------------------*/
echo json_encode([
    "success" => true,
    "leaderboard" => $lb,
    "analytics_saved" => true
]);
