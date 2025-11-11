// i couldn't make it as file and import it like axois
import Ajv from "https://cdn.jsdelivr.net/npm/ajv@8.17.1/+esm";
//https://stackoverflow.com/questions/78217036/typeerror-err-import-attribute-missing-module-package-json-needs-an-import
import schema from "../Schemas/schema.json" with { type: "json" };
//i put it in .gitignore to keep it "hidden"
import humanReviews from "../Schemas/human_reviews.json" with { type: "json" };

const ajv = new Ajv();
const validate = ajv.compile(schema);

function getHumanReviews(fileName) {
  return humanReviews.filter((review) => review.file === fileName);
}

async function runApiTests(sampleCodeSnippet) {
   try {
    const response = await fetch("http://localhost/assignment/tech/AICodeReviewer/api/review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCodeSnippet)
    });

    //https://www.geeksforgeeks.org/javascript/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript/ 
    // if not returning json
    const contentType = response.headers.get('content-type');
    console.log("returning content type of", contentType);
    if (!contentType || !contentType.includes('application/json')) {
          console.log("did not return json you returned:", contentType);
          // show to UI as well
          document.getElementById("response").textContent =
            "Did not return JSON. Content-Type: " + contentType;
            return;
    } 
    if (!response.ok) {
      console.log("error with fetching api endpoint " + response.status);
      document.getElementById("response").textContent =
        "Error fetching API: " + response.status;
      return;
    }else{
    console.log("API responded with success.");
    }

    const data = await response.json();
 console.log("Response:", data)

console.log("AI raw:", data.ai_raw);
console.log("Parsed review:", data.parsed);

    const valid = validate(data);
    if (!valid) {
      console.log("Schema validation failed:");
      console.log(validate.errors);
      // show errors in UI beneath response
      document.getElementById("response").textContent +=
        "\n\nSchema validation failed:\n" + JSON.stringify(validate.errors, null, 2);
      return;
    }else{
    console.log("Schema validation passed.");
   
    }

    const humanDiv = document.getElementById("humanReviews");

    const responseArray = Array.isArray(data) ? data : [data];

    const allHumanReviews = [];
    for (let i = 0; i < responseArray.length; i++) {
        const reviews = getHumanReviews(responseArray[i].file);
        for (let j = 0; j < reviews.length; j++) {
            allHumanReviews.push(reviews[j]);
        }
    }
    console.log(allHumanReviews.length)
    if (allHumanReviews.length > 0) {
        // humanDiv.textContent = JSON.stringify(allHumanReviews, null, 3);
        const container = document.getElementById("response2");
        container.innerHTML = ""; // delete previous carts

        for (let i = 0; i < allHumanReviews.length; i++) {
            const item = allHumanReviews[i];
            container.innerHTML += `
                <div class="review-card severity-${item.severity}">
                    <h3>File: ${item.file}</h3>
                    <p><strong>severity:</strong> ${item.severity}</p>
                    <p><strong>Issue:</strong> ${item.issue}</p>
                    <p><strong>Suggestion:</strong> ${item.suggestion}</p>
                </div>`;
        }
    } else {
        humanDiv.textContent = "No human reviews found for these files.";
    }

     console.log("All tests passed.");
   const container = document.getElementById("response");
        container.innerHTML = ""; // delete previous carts

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            container.innerHTML += `
                <div class="review-card severity-${item.severity}">
                    <h3>File: ${item.file}</h3>
                    <p><strong>severity:</strong> ${item.severity}</p>
                    <p><strong>Issue:</strong> ${item.issue}</p>
                    <p><strong>Suggestion:</strong> ${item.suggestion}</p>
                </div>`;
        }
        console.log("Response:", data);
  } catch (err) {
    console.log("Something went wrong:", err.message);
    console.log("Make sure PHP server is running and endpoint is correct and that its correct content type");
    document.getElementById("response").textContent =
      "Error: " + (err && err.message ? err.message : String(err));
  }
}

document.getElementById("sendBtn").addEventListener("click", async function() {
    var code = document.getElementById("code").value;

    // Build the sampleCodeSnippet using the textarea input
    const sampleCodeSnippet = {
      file: "sample.py",
      code: code
    };

    // For charbel
    // const humanReviews = [
    //   {
    //     severity: "medium",
    //     file: "sample.py",
    //     issue: "Variable 'c' and 'B' should follow naming conventions",
    //     suggestion: "Rename variables to follow standard naming conventions.",
    //   },
    //   {
    //     severity: "low",
    //     file: "sample.py",
    //     issue: "Good code structure",
    //     suggestion: "Maintain current structure; no changes needed.",
    //   },
    // ];

    try {
        await runApiTests(sampleCodeSnippet);
    } catch (err) {
        document.getElementById("response").textContent = "Error: " + err;
    }
});
