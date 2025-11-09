const API_ENDPOINT = "http://localhost/review.php";

const sampleCodeSnippet = {
  file: "sample.py",
  code: "a = c+B"
};
async function runApiTests() {
  try {
    const res = await fetch(API_ENDPOINT, {
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
  }

}

runApiTests();