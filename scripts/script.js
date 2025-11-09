
async function sendCode() {
    let textArea=document.getElementById("code");
    let code=textArea.value;
    try {
        let res=await axios.post("review.php",{
            code:code
        });
        document.getElementById("response").textContent=res.data;
    } catch (error) {
        document.getElementById("response").textContent="error!@js"+error;
    }
}

let btn=document.getElementById("sendBtn")
btn.addEventListener("click",function(){
    sendCode();
});