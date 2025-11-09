import dotenv from "dotenv";
dotenv.config();
const sampleCodeSnippet = {
  file: "sample.py",
  code: "a = c+B"
};

async function runApiTests() {
    const allowedSeverities = ["high", "medium", "low"];
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
    const data = await res.json();
    console.log("Response fetch successful");
   
    // to see if object or not
      for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) {
        console.log("not object at index " + i);
        return;
      }

      const required = ["severity", "file", "issue", "suggestion"];
      for (let j = 0; j < required.length; j++) {
        const key = required[j];
        if (!item[key] || typeof item[key] !== "string" || item[key].trim() === "") {
          console.log("Invalid field '" + key + "' in item " + i);
          return;
        }
      }

      if (allowedSeverities.indexOf(item.severity.toLowerCase()) === -1) {
        console.log("Invalid severity in item " + i + ": " + item.severity);
        return;
      }
      console.log("test passed")
    }
  }catch(err){
    console.log("error :" ,err)
  }

}

runApiTests();