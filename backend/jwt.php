<?php
// jwt.php - simple HS256 JWT helper for this project

function get_jwt_secret() {
    $f = __DIR__ . "/secret.key";
    if (file_exists($f)) {
        $s = trim(file_get_contents($f));
        if ($s !== "") return $s;
    }
    // fallback secret (change this in production!)
    return "please_change_this_secret";
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    // restore padding
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload) {
    $secret = get_jwt_secret();
    $header = ["alg" => "HS256", "typ" => "JWT"];
    $header_encoded  = base64url_encode(json_encode($header));
    $payload_encoded = base64url_encode(json_encode($payload));
    $signature = hash_hmac("sha256", "$header_encoded.$payload_encoded", $secret, true);
    $signature_encoded = base64url_encode($signature);
    return "$header_encoded.$payload_encoded.$signature_encoded";
}

/*
 * jwt_decode returns an associative array:
 *  [
 *    "valid" => bool,
 *    "payload" => array|null,
 *    "error" => string|null
 *  ]
 */
function jwt_decode($token) {
    $secret = get_jwt_secret();
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return ["valid" => false, "payload" => null, "error" => "Invalid token format"];
    }
    list($header_encoded, $payload_encoded, $signature_encoded) = $parts;

    $expected_signature = base64url_encode(
        hash_hmac("sha256", "$header_encoded.$payload_encoded", $secret, true)
    );

    if (!hash_equals($expected_signature, $signature_encoded)) {
        return ["valid" => false, "payload" => null, "error" => "Signature mismatch"];
    }

    $payload_json = base64url_decode($payload_encoded);
    $payload = json_decode($payload_json, true);
    if ($payload === null && json_last_error() !== JSON_ERROR_NONE) {
        return ["valid" => false, "payload" => null, "error" => "Invalid payload JSON"];
    }

    if (isset($payload["exp"]) && $payload["exp"] < time()) {
        return ["valid" => false, "payload" => $payload, "error" => "Token expired"];
    }

    return ["valid" => true, "payload" => $payload, "error" => null];
}

/* convenience: returns payload array or false */
function jwt_verify($token) {
    $res = jwt_decode($token);
    return $res["valid"] ? $res["payload"] : false;
}
