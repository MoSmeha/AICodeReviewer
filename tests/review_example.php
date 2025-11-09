<?php


header('Content-Type: application/json; charset=UTF-8');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// example response coming from fadi
$response = [
    [
        "severity" => "high",
        "file" =>  "unknown_file.py",
        "issue" => "no validation",
        "suggestion" => "validate the data before sending it"
    ]
];

echo json_encode($response);
