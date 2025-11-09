async function sendCode() {
    var code = document.getElementById("code").value;
    try {
        var res = await axios.post("review.php", 
            { code: code });

        document.getElementById("response").textContent =
            JSON.stringify(res.data, null, 3);  //it keep the format as its and make a spaces(data,replacer,space)
    } catch (err) {
        document.getElementById("response").textContent = "Error: " + err;
    }
}

document.getElementById("sendBtn").addEventListener("click", function() {
    sendCode();
});
