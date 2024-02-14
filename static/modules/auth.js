function checkCaptchaIfr(ele) {
  let doc = ele.contentWindow.document || ele.contentDocument;
  let rgt =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      doc.body.innerHTML,
    );
  console.log(rgt);
  return rgt;
}

function validateInput() {
    let usrEle = document.querySelector('input[type="username"]')
    let usrPwd = document.querySelector('input[type="password"]') 
    if (
        !usrEle.value ||
        usrEle.value == "" ||
        usrEle.value.length < 3 ||
        !usrPwd.value ||
        usrPwd.alue == "" ||
        usrPwd.value.length < 4 
        ) {
            return false
        }
    else {
        return true
    }
}

let interval = setInterval(() => {
  if (checkCaptchaIfr(document.querySelector(".captchaIframe"))) {
    document.querySelector(".captchaIframe").style.display = "none";
    document.querySelector(".successCaptcha").style.display = "block";
    clearInterval(interval);
  }
}, 250);
