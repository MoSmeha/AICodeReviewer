<?php

include __DIR__ . "/../config/config.php";
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Read input from frontend
$input = json_decode(file_get_contents("php://input"), true);
$code = $input["code"] ?? "No code provided";

// OpenAI request
$url = "https://api.openai.com/v1/chat/completions";

$data = [
    "model" => "gpt-4o-mini",
    "messages" => [
        [
            "role" => "system",
            "content" => "You are a helpful code reviewer. Respond ONLY with a valid JSON array of objects. 
            Each object must have the keys: severity (high, medium, low), file (programming language), issue, suggestion.
            Do NOT add any extra text, explanation, or formatting. The response must be valid JSON parsable by JSON.parse."
        ],
        [
            "role" => "user",
            "content" => $code
        ]
    ]
];

$headers = [
    "Content-Type: application/json",
    "Authorization: " . "Bearer " . $OPENAI_API_KEY
];

// Initialize cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);


curl_close($ch);



// Decode response
$response_decoded = json_decode($response, true);

if (!isset($response_decoded['choices'][0]['message']['content'])) {
    echo json_encode([
        "error" => "No content returned from OpenAI",
        "raw_response" => $response
    ]);
    exit;
}

// Extract AI content
$ai_content = trim($response_decoded['choices'][0]['message']['content']);

// Decode AI JSON string
$final_review = json_decode($ai_content, true);

// If decoding fails, try wrapping single object into array
if (!is_array($final_review)) {
    $single_obj = json_decode("[$ai_content]", true);
    $final_review = is_array($single_obj) ? $single_obj : [];
}

// Return valid JSON
echo json_encode($final_review);
