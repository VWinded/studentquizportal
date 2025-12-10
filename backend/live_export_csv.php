<?php
require_once __DIR__ . "/cors.php";

$file = __DIR__ . "/live_attempts.json";
$rows = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

header("Content-Type: text/csv");
header("Content-Disposition: attachment; filename=live_quiz_data.csv");

$output = fopen("php://output", "w");

fputcsv($output, ["User", "Email", "Platform", "Score", "Date"]);

foreach ($rows as $r) {
    if ($r["status"] === "approved") {
        fputcsv($output, [
            $r["user"],
            $r["email"],
            $r["platform"],
            $r["score"],
            $r["date"]
        ]);
    }
}

fclose($output);
