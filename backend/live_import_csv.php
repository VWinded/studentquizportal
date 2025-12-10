<?php
require_once __DIR__ . "/cors.php";
header("Content-Type: application/json");

// File path for live attempts
$file = __DIR__ . "/live_attempts.json";

// Load existing attempts
$existing = file_exists($file)
    ? json_decode(file_get_contents($file), true)
    : [];

if (!is_array($existing)) {
    $existing = [];
}

// -------------------------------------------------------------
// ⭐ 1. Check if CSV uploaded
// -------------------------------------------------------------
if (!isset($_FILES["csv"]) || $_FILES["csv"]["error"] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "CSV file not uploaded"]);
    exit;
}

// -------------------------------------------------------------
// ⭐ 2. Validate file type and size
// -------------------------------------------------------------
$allowed = ["text/csv", "application/vnd.ms-excel"];
$sizeLimit = 10 * 1024 * 1024; // 10 MB

if (!in_array($_FILES["csv"]["type"], $allowed)) {
    echo json_encode(["status" => "error", "message" => "Invalid file format"]);
    exit;
}

if ($_FILES["csv"]["size"] > $sizeLimit) {
    echo json_encode(["status" => "error", "message" => "CSV file is too large"]);
    exit;
}

// -------------------------------------------------------------
// ⭐ 3. Read CSV file
// -------------------------------------------------------------
$csvTmp = $_FILES["csv"]["tmp_name"];
$handle = fopen($csvTmp, "r");

if (!$handle) {
    echo json_encode(["status" => "error", "message" => "Unable to open CSV"]);
    exit;
}

$header = fgetcsv($handle);

// Expected columns
$expected = ["user", "email", "platform", "score", "date", "status"];

foreach ($expected as $col) {
    if (!in_array($col, $header)) {
        echo json_encode([
            "status" => "error",
            "message" => "CSV must include columns: " . implode(", ", $expected)
        ]);
        exit;
    }
}

$importedCount = 0;

// -------------------------------------------------------------
// ⭐ 4. Read each row + merge into database
// -------------------------------------------------------------
while (($row = fgetcsv($handle)) !== false) {

    $data = array_combine($header, $row);

    if (!$data) continue;

    // Clean values
    $user     = trim($data["user"]);
    $email    = trim($data["email"]);
    $platform = trim($data["platform"]);
    $score    = trim($data["score"]);
    $date     = trim($data["date"]);
    $status   = strtolower(trim($data["status"]));

    // Skip incomplete rows
    if ($user === "" || $email === "" || $platform === "") continue;

    // Convert imported status -> approved (admin validation)
    if ($status !== "approved") {
        $status = "approved";
    }

    // Avoid duplicates (same user + email + platform + date)
    $duplicate = false;

    foreach ($existing as $e) {
        if (
            $e["email"] === $email &&
            $e["platform"] === $platform &&
            $e["date"] === $date
        ) {
            $duplicate = true;
            break;
        }
    }

    if ($duplicate) continue;

    // Add new imported row
    $existing[] = [
        "user"     => $user,
        "email"    => $email,
        "platform" => $platform,
        "score"    => $score,
        "date"     => $date,
        "status"   => "approved",
        "proof"    => "Imported via CSV"
    ];

    $importedCount++;
}

fclose($handle);

// -------------------------------------------------------------
// ⭐ 5. Save back to JSON
// -------------------------------------------------------------
file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT));

echo json_encode([
    "status" => "ok",
    "message" => "Imported $importedCount records successfully"
]);
