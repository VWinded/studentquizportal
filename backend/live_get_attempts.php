<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

$file = __DIR__ . "/live_attempts.json";

echo file_exists($file) ? file_get_contents($file) : "[]";
