async function md5(input) {
  // it doesn't need to be async but it is to math with the sha256 hashing function
  return hex_md5(input); // defined if imported correctly
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const pswRegex =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[_!@#$%^&*:;.,?])(?!.*[\\\/<>'"]).{10,}$/;
const usrRegex = /^[a-z0-9_.]{3,24}$/;

function validateCreds(usr, pwd) {
  return pswRegex.test(pwd) && usrRegex.test(usr);
}

function checkCaptchaIfr(ele) {
  let doc = ele.contentWindow.document || ele.contentDocument;
  let rgt =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      doc.body.innerHTML,
    );
  return rgt;
}

function validateInput() {
  let usrEle = document.querySelector('input[type="username"]');
  let usrPwd = document.querySelector('input[type="password"]');
  if (
    usrEle.value &&
    usrEle.value != "" &&
    usrEle.value.length > 3 &&
    usrPwd.value &&
    usrPwd.value != "" &&
    usrPwd.value.length > 4 &&
    usrRegex.test(usrEle.value)
  ) {
    return true;
  } else {
    return false;
  }
}

let captchaInterval = setInterval(() => {
  try {
    if (checkCaptchaIfr(document.querySelector(".captchaIframe"))) {
      document.querySelector(".captchaIframe").style.display = "none";
      document.querySelector(".successCaptcha").style.display = "block";
      if (
        validateInput() &&
        checkCaptchaIfr(document.querySelector(".captchaIframe"))
      ) {
        document.querySelector(".loginButton").disabled = false;
      } else {
        document.querySelector(".loginButton").disabled = true;
      }
      clearInterval(captchaInterval);
    }
  } catch {}
}, 250);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".loginButton").disabled = true;
  let usrEle = document.querySelector('input[type="username"]');
  let usrPwd = document.querySelector('input[type="password"]');
  usrEle.value = "";
  usrPwd.value = "";
  document.querySelectorAll("input").forEach((input) => {
    function eventTriggered(e) {
      console.log(e.type + " triggered");
      if (
        validateInput() &&
        checkCaptchaIfr(document.querySelector(".captchaIframe"))
      ) {
        document.querySelector(".loginButton").disabled = false;
      } else {
        document.querySelector(".loginButton").disabled = true;
      }
    }
    input.addEventListener("blur", (e) => {
      eventTriggered(e);
    });
    input.addEventListener("click", (e) => {
      eventTriggered(e);
    });
  });
});

async function login(usr, pwd) {
  // DO NOT deal with any credentials before hashing them
  if (
    checkCaptchaIfr(document.querySelector(".captchaIframe")) &&
    validateCreds(usr, pwd)
  ) {
    // prevent bypassing captcha
    usr = "md5:" + (await md5(usr));
    pwd = "sha256:" + (await sha256(pwd));
    res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usr: usr, pwd: pwd, em: " " }),
    });
    return res;
  } else {
    return undefined;
  }
}
async function signup(usr, pwd, em) {
  // DO NOT deal with any credentials before hashing them
  if (
    checkCaptchaIfr(document.querySelector(".captchaIframe")) &&
    validateCreds(usr, pwd)
  ) {
    // prevent bypassing captcha
    usr = "md5:" + (await md5(usr));
    pwd = "sha256:" + (await sha256(pwd));
    res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ usr: usr, pwd: pwd, em: em }),
    });
    return res;
  } else {
    return undefined;
  }
}
