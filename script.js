import Ajv from "https://cdn.jsdelivr.net/npm/ajv@8.17.1/+esm";
//https://stackoverflow.com/questions/78217036/typeerror-err-import-attribute-missing-module-package-json-needs-an-import
import schema from "./tests/schema.json" with { type: "json" };
//i put it in .gitignore to keep it "hidden"
import humanReviews from "./tests/human_reviews.json" with { type: "json" };

const ajv = new Ajv();
const validate = ajv.compile(schema);

function getHumanReviews(fileName) {
  return humanReviews.filter((review) => review.file === fileName);
}

async function runApiTests(sampleCodeSnippet) {
   try {
    const response = await fetch("http://localhost/AI/AICodeReviewer/review.php", {
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
    console.log("Response:", data);

    // show raw response in UI (preserving format)
    document.getElementById("response").textContent =
        JSON.stringify(data, null, 3);  // keep the format and make spaces

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

    // Expecting `data` to be an array; if not, handle gracefully
    if (!Array.isArray(data)) {
      console.log("Warning: response is not an array. Adjusting to single-item array.");
    }

    (Array.isArray(data) ? data : [data]).forEach((item) => {
      const matchingReviews = getHumanReviews(item.file);
      if (matchingReviews.length > 0) {
        console.log("Human Reviews Found for file:", item.file);
        console.log(matchingReviews);
      } else {
        console.log("No human review found for file:", item.file);
      }
    });

     console.log("All tests passed.");
  } catch (err) {
    console.log("Something went wrong:", err.message);
    console.log("Make sure PHP server is running and endpoint is correct and that its correct content type");
    document.getElementById("response").textContent =
      "Error: " + (err && err.message ? err.message : String(err));
  }
}

// Keep the event listener as you had it, but call runApiTests using the textarea input
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
        // Replace axios usage with our fetch-based runApiTests
        await runApiTests(sampleCodeSnippet);
    } catch (err) {
        document.getElementById("response").textContent = "Error: " + err;
    }
});