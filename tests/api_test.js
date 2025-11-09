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

async function runApiTests() {
   try {
    const response = await fetch(process.env.API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCodeSnippet)
    });

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
    console.log("All tests passed.");
    }

  } catch (err) {
    console.log("Something went wrong:", err.message);
    console.log("Make sure PHP server is running and endpoint is correct");
  }
}

runApiTests();