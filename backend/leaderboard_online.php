<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");
date_default_timezone_set("Asia/Kolkata");

$file = "leaderboard_online.json";

// POST → Save new score
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) { echo "Invalid JSON"; exit; }

    // Real timeTaken from frontend (can be 0)
    $timeTaken = isset($input["timeTaken"]) ? (int)$input["timeTaken"] : 0;

    // Date/time of attempt
    $date = date("Y-m-d H:i");

    // Prepare entry (old logic + extended fields)
    $newRow = [
    "name"       => $input["name"],
    "score"      => $input["score"],
    "total"      => $input["total"],     // ⭐ ADD THIS LINE
    "category"   => $input["category"],
    "difficulty" => $input["difficulty"],
    "time"       => $timeTaken . " sec",
    "datetime"   => $date
];


    // Read existing
    $old = [];
    if (file_exists($file)) {
        $old = json_decode(file_get_contents($file), true);
    }
    if (!is_array($old)) $old = [];

    // Add entry
    array_unshift($old, $newRow);

    // Sort — High score first, low time earlier
    usort($old, function($a, $b){
        if ($b["score"] != $a["score"]) {
            return $b["score"] - $a["score"];
        }

        // extract numeric seconds from "12 sec"
        $ta = (int)filter_var($a["time"], FILTER_SANITIZE_NUMBER_INT);
        $tb = (int)filter_var($b["time"], FILTER_SANITIZE_NUMBER_INT);

        return $ta - $tb;
    });

    // Save
    file_put_contents($file, json_encode($old, JSON_PRETTY_PRINT));

    echo "OK";
    exit;
}

// GET → return leaderboard
echo file_exists($file) ? file_get_contents($file) : "[]";
