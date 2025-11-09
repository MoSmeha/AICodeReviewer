<?php
include "config.php";

// Read the input from frontend
$input = json_decode(file_get_contents("php://input"), true);
$code = $input["code"] ?? "No code provided";

//  Preparing OpenAI request
$url = "https://api.openai.com/v1/chat/completions";

$data = [
    "model" => "gpt-4o-mini",
    "messages" => [
        [
            "role" => "system",
            "content" => "You are a helpful code reviewer. Respond ONLY with a JSON array of objects.
             Each object must have keys: severity:high or low or medium,file:progaraming language, issue, suggestion.
             Do NOT add any extra text, explanation, or punctuation outside the JSON array.
             Response must be pure JSON (array). Do not include markdown fences."
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

// Send request to OpenAI
// https://www.php.net/manual/en/function.curl-setopt.php
// curl is :a command-line tool for transferring data to or from a server using various protocols like HTTP, HTTPS, FTP
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true); // Set the request method to POST for AI chat
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers); // Add the required headers
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data)); // Pass the request payload AI in JSON format
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);// return the response as a string
$response = curl_exec($ch);
curl_close($ch);

//Extract AI response content
$response_decoded = json_decode($response, true);
$ai_content = $response_decoded['choices'][0]['message']['content'] ?? "[error!]";

// Decode AI JSON string to PHP array
$final_review = json_decode($ai_content, true);

// Safety check  if decoding fails, return empty array
if (!is_array($final_review)) {
    echo "invalid ";
    $final_review = [];
   
}

//Return JSON to frontend
header("Content-Type: application/json");
echo json_encode($final_review);
