async function md5(input) {
  // it doesn't need to be async but it is to match with the sha256 hashing function
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
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  let emailE = document.querySelector('input[type="email"]');
  if (
    usrEle.value &&
    usrEle.value != "" &&
    usrEle.value.length > 3 &&
    usrPwd.value &&
    usrPwd.value != "" &&
    usrPwd.value.length > 4 &&
    usrRegex.test(usrEle.value)
  ) {
    if (emailE) {
      return true;
    } else {
      return true;
    }
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
  setTimeout(() => {
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
      input.addEventListener("hover", (e) => {
        eventTriggered(e);
      });
      document.querySelector(".loginButton").addEventListener("hover", (e) => {
        eventTriggered(e);
      });
    });
  }, 400);
});

async function login(usr, pwd) {
  if (
    // prevent bypassing captcha
    checkCaptchaIfr(document.querySelector(".captchaIframe")) &&
    validateCreds(usr, pwd)
  ) {
    // DO NOT deal with any credentials before hashing them
    usr = "md5:" + (await md5(usr));
    pwd = "sha256:" + (await sha256(pwd));
    res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usr: usr, pwd: pwd, em: " " }),
    });
    localStorage["username"] = usr.replace("md5:", "");
    return res;
  } else {
    alert(
      "ERR: Your username/password does not meet requirements or you didn't pass the CAPTCHA yet",
    );
    return undefined;
  }
}
async function signup(usr, pwd, em) {

  if (
    checkCaptchaIfr(document.querySelector(".captchaIframe")) &&
    validateCreds(usr, pwd)
  ) {
    // prevent bypassing captcha
    safe = await fetch("/api/auth/pwdsafe", {
      method: "POST",
      body: pwd,
    });
    if ((await safe.text()) == "false") {
      alert(
        "This password seems to be a common password. Please use a stronger, more unique password.",
      );
      return undefined;
    }
    display = usr
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

async function loginForm() {
  let usrEle = document.querySelector('input[type="username"]');
  let usrPwd = document.querySelector('input[type="password"]');
  let res = await login(usrEle.value, usrPwd.value);
  if (res != undefined) {
    if (res.ok) {
      localStorage["DEBLOKAUTH"] = await res.text();
      let redirect =
        new URLSearchParams(window.location.search).get("redirect_to") || "/";
      document.location = redirect
        .replaceAll("javascript", "")
        .replaceAll("http:", "")
        .replaceAll("https:", "");
    } else {
      alert(await res.text());
      usrPwd.value = "";
      usrEle.value = "";
    }
  } else {
    alert("You seem to not meet requirements.")
  }
  return res;
}
async function signupForm() {
  let usrEle = document.querySelector('input[type="username"]');
  let usrPwd = document.querySelector('input[type="password"]');
  let emailE = document.querySelector('input[type="email"]');
  let res = await signup(usrEle.value, usrPwd.value, emailE.value);
  if (res != undefined) {
    if (res.ok) {
      let lres = await login(usrEle.value, usrPwd.value);
      if (lres != undefined && lres.ok) {
        
        localStorage["DEBLOKAUTH"] = await lres.text();
        (async()=>{
          await fetch("/api/auth/updatedisplayname",{
            "method":"POST",
            "body": JSON.stringify({
              "newname":usrEle.value,
              "for": (await md5(usrEle.value)),
              "auth": localStorage.DEBLOKAUTH
            })
          })
        })();
        let redirect =
          new URLSearchParams(window.location.search).get("redirect_to") || "/";
        document.location = redirect
          .replaceAll("javascript", "")
          .replaceAll("http:", "")
          .replaceAll("https:", "");
      }
    } else {
      alert(await res.text());
      usrPwd.value = "";
      usrEle.value = "";
    }
  } else {

      alert("You seem to not meet requirements.")
    
  }
  return res;
}
