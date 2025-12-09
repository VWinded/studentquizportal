<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// file that stores quiz attempts
$file = __DIR__ . "/attempts.json";

if (!file_exists($file)) {
    echo json_encode([]);
    exit;
}

$data = json_decode(file_get_contents($file), true);
if (!is_array($data)) $data = [];

echo json_encode($data);
