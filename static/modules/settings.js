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

setTimeout((async ()=> {
let res = await fetch(`/api/auth/getuserinfo/${localStorage.username}`)
document.querySelector(".displaynameInput").value = (await res.json()).displayName
}),50)
setTimeout((async ()=> {
  let res = await fetch(`/api/auth/getuserinfo/${localStorage.username}`)
  document.querySelector(".displayName").innerText = (await res.json()).displayName
  }),50)