<?php
require_once __DIR__ . "/jwt.php";
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");
$headers = getallheaders();
$auth = $headers["Authorization"] ?? "";

if (!$auth || stripos($auth, "Bearer ") !== 0) {
    echo json_encode(["error" => "No token"]);
    exit;
}

$token = trim(substr($auth, 7));
$check = jwt_decode($token);

if (!$check["valid"]) {
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$user = $check["payload"];
if ($user["role"] !== "admin") {
    echo json_encode(["error" => "Access denied"]);
    exit;
}

$id = $_GET["id"] ?? null;

if (!$id) {
    echo json_encode(["error" => "ID required"]);
    exit;
}

$file = __DIR__ . "/questions.json";
$list = json_decode(file_get_contents($file), true);

$list = array_values(array_filter($list, fn($q) => $q["id"] != $id));

file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
