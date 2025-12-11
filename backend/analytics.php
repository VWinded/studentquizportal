<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// Read raw POST input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input["user"]) || !isset($input["role"])) {
    echo json_encode([]);
    exit;
}

$userEmail = $input["user"];
$role = $input["role"];

// Load attempts.json
$attemptsFile = __DIR__ . "/attempts.json";
$attempts = file_exists($attemptsFile) ? json_decode(file_get_contents($attemptsFile), true) : [];
if (!is_array($attempts)) $attempts = [];

// ALSO load live_attempts.json (if exists) and merge
$liveFile = __DIR__ . "/live_attempts.json";
$liveAttempts = file_exists($liveFile) ? json_decode(file_get_contents($liveFile), true) : [];
if (!is_array($liveAttempts)) $liveAttempts = [];

// Ensure live attempts have the same basic keys as attempts.json (no mutation of original)
// (we won't modify arrays in-place to avoid surprising side-effects)
$merged = array_merge($attempts, $liveAttempts);

// ⭐ ADMIN → return ALL attempts (merged)
if ($role === "admin") {
    echo json_encode(array_values($merged));
    exit;
}

// ⭐ STUDENT → return only his attempts from merged data
$userData = array_filter($merged, function($a) use ($userEmail) {
    return isset($a["email"]) && $a["email"] === $userEmail;
});

echo json_encode(array_values($userData));
