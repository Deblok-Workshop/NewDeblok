let captchaId;
document.getElementById("captchaAnswer").value = "";
function req() {
  document.getElementById("captchaAnswer").value = "";
  return fetch("/api/captcha/request")
    .then((response) => {
      if (response.status === 429) {
        alert("You are being rate limited. Please try again later.");
        document.getElementById("regenerateButton").disabled = true;
        document.getElementById("captchaImage").style.display = "none";
        throw new Error("Rate Limited");
      }
      return response.text();
    })
    .then((id) => {
      captchaId = id;
      document.getElementById("captchaImage").src =
        `/api/captcha/${id}/image.gif`;
      document.getElementById("captchaImage").alt = id;
      document.getElementById("captchaImage").style.display = "block";
      document.getElementById("regenerateButton").disabled = false;
    });
}

function validate() {
  const cId = captchaId;
  const captchaAnswer = document.getElementById("captchaAnswer").value;
  fetch(`/api/captcha/${cId}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: captchaAnswer,
  })
    .then((response) => response.text())
    .then((result) => {
      if (result === "true") {
        console.log("Captcha passed!");
        document.write(document.getElementById("captchaImage").alt);
        /* regex for uuids: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/ */
      } else {
        console.log("Captcha failed!");
        req();
      }
    });
}

function regen() {
  const cId = captchaId;
  document.getElementById("captchaAnswer").value = "";
  fetch(`/api/captcha/${cId}/void`)
    .then((response) => {
      if (response.status === 429) {
        alert("You are being rate limited. Please try again later.");
        document.getElementById("regenerateButton").disabled = true;
        document.getElementById("captchaImage").style.display = "none";
        throw new Error("Rate Limited");
      } else {
        return req();
      }
    })
    .catch((error) => {
      console.error("Error occurred:", error);
    });
}

// Call req when the page loads
req();
