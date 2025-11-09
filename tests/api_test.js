import dotenv from "dotenv";
dotenv.config();
const sampleCodeSnippet = {
  file: "sample.py",
  code: "a = c+B"
};
console.log(process.env.API_ENDPOINT)
async function runApiTests() {
  try {
    const res = await fetch(process.env.API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleCodeSnippet)
    });

    if (!res.ok) {
      console.log(`connection failed : ${res.status}`);
      return;
    }
    const json = await res.json();
    console.log("Response:", json);
  }catch(err){
    console.log("error :" ,err)
  }

}

runApiTests();