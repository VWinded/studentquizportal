<?php
require_once __DIR__ . "/cors.php";
require_once __DIR__ . "/jwt.php";
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

// read Authorization header
$headers = function_exists("getallheaders") ? getallheaders() : [];
$authHeader = "";
foreach ($headers as $k => $v) {
    if (strtolower($k) === "authorization") {
        $authHeader = $v;
        break;
    }
}
if (!$authHeader || stripos($authHeader, "Bearer ") !== 0) {
    echo json_encode(["valid" => false, "error" => "No token provided"]);
    exit;
}

$token = trim(substr($authHeader, 7));
$payload = jwt_verify($token);

if (!$payload) {
    echo json_encode(["valid" => false, "error" => "Invalid or expired token"]);
    exit;
}

unset($payload["exp"]); // don't send exp to client
echo json_encode(["valid" => true, "user" => $payload]);
