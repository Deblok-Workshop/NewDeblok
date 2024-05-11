
function checkbox_check(ele) {
  let ifsect = ele.parentElement.querySelector(".if-section");
  if (ifsect != undefined) {
    ifsect.classList.toggle("opacity-50");
    ifsect.classList.toggle("active");
  }

  if (ele.querySelector("input").checked) {
    var title = document.querySelector(".cloakTitle").value;
    var iconUrl = document.querySelector(".cloakIconUrl").value;
    cloakTab(iconUrl, title);
  }
}

function changeTheme(ele) {
  themetxt = ele.innerText.toLowerCase();
  console.log(themetxt);
  localStorage["themeSelected"] = themetxt;
  updateTheme();
  if (document.querySelector("html").classList.contains("windowsxp")) {
    document.querySelector(".bgURL").value = "Overriden by theme."
    document.querySelector(".bgURL").disabled = true
  } else {
    document.querySelector(".bgURL").disabled = false
    if (document.querySelector(".bgURL").value == "Overriden by theme.") {
      document.querySelector(".bgURL").value = localStorage.bgUrl ?? "assets/bg.webp"
      document.body.style.backgroundImage = `url(${document.querySelector(".bgURL").value})`
    }
  }
}

function cloakTab(iconUrl, title) {
  var l =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  l.type = "image/png";
  l.rel = "shortcut icon";
  l.href = iconUrl;
  document.getElementsByTagName("head")[0].appendChild(l);
  document.title = title;
}

function updateDisplayName() {
  let display = document.querySelector(".displaynameInput").value;
  document.querySelector(".displayName").innerText = display;
(async()=>{
  await fetch("/api/auth/updatedisplayname",{
    "method":"POST",
    "body": JSON.stringify({
      "newname":display,
      "for": localStorage.username,
      "auth": localStorage.DEBLOKAUTH
    })
  })
})();
}

async function updateBG() {
  try {
  let __ = await fetch(document.querySelector(".bgURL").value, {"mode":"no-cors"})
  } catch {
    localStorage.bgUrl = "assets/bg.webp"
    document.querySelector(".bgURL").value = "assets/bg.webp"
    return;
  }
  if (!document.querySelector(".bgURL").value.trim() == "") {
    localStorage.bgUrl = document.querySelector(".bgURL").value
    document.body.style.backgroundImage = `url(${document.querySelector(".bgURL").value})`
  } else {
    localStorage.bgUrl = "assets/bg.webp"
    document.querySelector(".bgURL").value = "assets/bg.webp"
  }
  if (document.querySelector("html").classList.contains("windowsxp")) {
    document.querySelector(".bgURL").value = "Overriden by theme."
    document.querySelector(".bgURL").disabled = true
  } else {
    document.querySelector(".bgURL").disabled = false
    if (document.querySelector(".bgURL").value == "Overriden by theme.") {
      document.querySelector(".bgURL").value = localStorage.bgUrl ?? "assets/bg.webp"
      document.body.style.backgroundImage = `url(${document.querySelector(".bgURL").value})`
    }
  }
}

setTimeout((async ()=> {
let res = await fetch(`/api/auth/getuserinfo/${localStorage.username}`)
document.querySelector(".displaynameInput").value = (await res.json()).displayName
}),50)
setTimeout((async ()=> {
  let res = await fetch(`/api/auth/getuserinfo/${localStorage.username}`)
  document.querySelector(".displayName").innerText = (await res.json()).displayName
  document.querySelector(".bgURL").value = localStorage.bgUrl ?? "assets/bg.webp"
  if (document.querySelector("html").classList.contains("windowsxp")) {
    document.querySelector(".bgURL").value = "Overriden by theme."
    document.querySelector(".bgURL").disabled = true
  }
  }),50)
