<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

// URL distante à récupérer
if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "Missing URL";
    exit;
}

$url = $_GET['url'];

// Sécurité : autoriser uniquement n01darts.com
if (!str_starts_with($url, "https://n01darts.com/")) {
    http_response_code(403);
    echo "Forbidden";
    exit;
}

// Récupération via cURL (plus fiable que file_get_contents)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // sécurise HTTPS
curl_setopt($ch, CURLOPT_USERAGENT, "Overlay/LiveScore"); // certains sites bloquent sinon

$response = curl_exec($ch);
$err = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $code >= 400) {
    http_response_code(502);
    echo "Erreur proxy: $err (HTTP code $code)";
    exit;
}

echo $response;
