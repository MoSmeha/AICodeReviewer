import dotenv from "dotenv";
import Ajv from "ajv";
//https://stackoverflow.com/questions/78217036/typeerror-err-import-attribute-missing-module-package-json-needs-an-import
import schema from "./schema.json" with {type:'json'}
dotenv.config();

const ajv = new Ajv();
const validate = ajv.compile(schema);

const sampleCodeSnippet = {
  file: "sample.py",
  code: "a = c+B"
};

const humanReviews = [
  {
    severity: "medium",
    file: "sample.py",
    issue: "Variable 'c' and 'B' should follow naming conventions",
    suggestion: "Rename variables to follow standard naming conventions.",
  },
  {
    severity: "low",
    file: "sample.py",
    issue: "Good code structure",
    suggestion: "Maintain current structure; no changes needed.",
  },
];

function getHumanReviews(fileName) {
  return humanReviews.filter((review) => review.file === fileName);
}


async function runApiTests() {
   try {
    const response = await fetch(process.env.API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCodeSnippet)
    });

    //https://www.geeksforgeeks.org/javascript/how-to-check-if-the-response-of-a-fetch-is-a-json-object-in-javascript/ 
    // if not returning json
    const contentType = response.headers.get('content-type');
    console.log("returning content type of",contentType)
    if (!contentType.includes('application/json')) {
          console.log("did not return json you returned:", contentType)
            return;
    } 
    if (!response.ok) {
      console.log("error with fetching api endpoint " + response.status);
      return;
    }else{
    console.log("API responded with success.");
    }

    const data = await response.json();
    console.log("Response:", data);

    const valid = validate(data);
    if (!valid) {
      console.log("Schema validation failed:");
      console.log(validate.errors);
      return;
    }else{
    console.log("Schema validation passed.");
   
    }

      data.forEach((item) => {
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
  }
}

runApiTests();