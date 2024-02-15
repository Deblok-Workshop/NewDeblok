function checkbox_check(ele) {
  let ifsect = ele.parentElement.querySelector(".if-section");
  if (ifsect != undefined) {
    ifsect.classList.toggle("opacity-50");
    ifsect.classList.toggle("active");
  }

  if (ele.querySelector('input').checked) {
    var title = document.querySelector('.cloakTitle').value;
    var iconUrl = document.querySelector('.cloakIconUrl').value;
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
  var l = document.querySelector("link[rel*='icon']") || document.createElement('link');
  l.type = 'image/x-icon';
  l.rel = 'shortcut icon';
  l.href = iconUrl;
  document.getElementsByTagName('head')[0].appendChild(l);
  document.title = title;
}

let emergencyButtonListener = null;

function emergencyButtonCheck(checkboxElement) {
  if (checkboxElement.checked) {
    if (emergencyButtonListener) {
      document.removeEventListener("keydown", emergencyButtonListener);
    }
    const action = document.querySelector('.enableEmergencyButton + .if-section select').value;
    const keybind = document.querySelector('.emergencyButtonKeybind').value.toUpperCase();
    const requireShift = document.querySelector('.requireShift').checked;
    const requireCtrl = document.querySelector('.requireCtrl').checked;
    emergencyButtonListener = function (event) {
      if ((requireShift ? event.shiftKey : true) && (requireCtrl ? event.ctrlKey : true) && event.key.toUpperCase() === keybind) {
        if (action === 'Close Tab') {
          window.close();
        } else if (action === 'Redirect to Safe Page') {
          window.location.href = "https://docs.google.com/";
        }
      }
    };
    document.addEventListener("keydown", emergencyButtonListener);
  } else if (emergencyButtonListener) {
    document.removeEventListener("keydown", emergencyButtonListener);
    emergencyButtonListener = null;
  }
}