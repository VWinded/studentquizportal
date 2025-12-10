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
$file = __DIR__ . "/attempts.json";

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

$data = json_decode(file_get_contents($file), true);
if (!is_array($data)) $data = [];

// ⭐ ADMIN → return ALL attempts
if ($role === "admin") {
    echo json_encode($data);
    exit;
}

// ⭐ STUDENT → return only his attempts
$userData = array_filter($data, function($a) use ($userEmail) {
    return isset($a["email"]) && $a["email"] === $userEmail;
});

echo json_encode(array_values($userData));
