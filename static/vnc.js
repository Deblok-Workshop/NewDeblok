document.querySelector(".connectingTip").innerText =
  tips[Math.floor(Math.random() * tips.length)];

(async () => {
  if (localStorage["DEBLOKAUTH"] != undefined) {
    let tkncheck = await fetch("/api/auth/tokenvalidate", {
      method: "POST",
      body: localStorage["DEBLOKAUTH"],
    });
    if (tkncheck.ok) {
    } else {
      if ((tkncheck.status = 429)) {
        window.location.href = `/503_err.html#2`;
      } else {
        document.location = "login.html";
      }
    }
  } else {
    document.location = "login.html";
  }
})();
(() => {
  if (document.location.hash == "#" || document.location.hash == "") {
    document.location = "/";
  }
  console.log(document.location.hash);
  let params = document.location.hash.split(";");
  if (!params || !params[0] || !params[1] || !params[2]) {
    document.write("ERR: all fields are required.");
    return;
  }
  let img = params[0];
  let port = params[1];
  let node = params[2];
  window.img = img;
  window.port = port;
  window.node = node;
  setTimeout(() => {
    document.querySelector("iframe.vnc").src =
      `/vnc/vnc.html?path=ws/${node}/port/${port}/websockify&autoconnect=true&scaling=remote&password=12345678&quality=6&compression=5&logging=info&reconnect=true&reconnect_delay=2000`;
  }, 200);

  // todo actually get from deblokmanager node, but for now we're gonna use slightly lower than inital default keepalive.
  setTimeout(async () => {
    await fetch("/api/container/keepalive", {
      method: "POST",
      body: JSON.stringify({
        id: img.replace("#", ""),
        node: Number(params[2]),
        for: localStorage["username"],
      }),
    });
    let UI = document.querySelector("iframe.vnc").contentWindow.novncui;
    window.UI = UI;
  }, 3000);
  setInterval(async () => {
    await fetch("/api/container/keepalive", {
      method: "POST",
      body: JSON.stringify({
        id: img.replace("#", ""),
        node: Number(params[2]),
        for: localStorage["username"],
      }),
    });
  }, 45000);
  window.history.pushState(
    { pageTitle: "Student Dashboard" },
    "",
    `/#/student/dashboard?__jsession=${crypto.randomUUID()}`,
  );
})();
let intentionalDisconnect = false;

setInterval(() => {
  document
    .querySelector("iframe.vnc")
    .contentDocument.querySelector("#noVNC_control_bar").style.transform =
    "translateY(75px)";
}, 500);
let UI;
let autoconnect = setInterval(() => {
  let UI = document.querySelector("iframe.vnc").contentWindow.novncui;
  window.UI = UI;
  if (!window.UI.rfb) {
    window.UI.closeConnectPanel();
    window.UI.connect();
    intentionalDisconnect = false;
    setTimeout(() => {
      if (window.UI.connected || window.UI.rfb) {
        clearInterval(autoconnect);
      }
    }, 800);
  }
}, 2000);
setInterval(() => {
  document.querySelector(".connectingTip").innerText =
    tips[Math.floor(Math.random() * tips.length)];
}, 10000);
let connectOverlay = setInterval(() => {
  let UI = document.querySelector("iframe.vnc").contentWindow.novncui;
  window.UI = UI;
  if (window.UI.rfb) {
    window.UI.rfb.resizeSession = true;
    window.UI.rfb.scaleViewport = true;
    intentionalDisconnect = false;
    // clearInterval(connectOverlay)
    document.querySelector(".connectingOverlay").style.transform = "scale(0)";
    // setTimeout(()=>{document.querySelector(".connectingOverlay").remove()},500)
  } else {
    if (!intentionalDisconnect) {
      document.querySelector(".connectingOverlay").style.transform = "scale(1)";
    }
  }
}, 300);
setInterval(() => {
  let ele = document
    .querySelector("iframe.vnc")
    .contentDocument.querySelectorAll(".noVNC_button");
  for (let i = 0; i < ele.length; i++) {
    ele[i].style.display = "none";
  }
  document
    .querySelector("iframe.vnc")
    .contentDocument.querySelector("#noVNC_settings_button").style.display =
    "block";
}, 500);
function killContainer() {
  try {
    document.querySelector(".connectCancelBtn").remove();
  } catch {}
  document.querySelector(".connectingOverlay h2").innerText =
    "Deleting container...";
  intentionalDisconnect = false;
  (async () => {
    let UI = document.querySelector("iframe.vnc").contentWindow.novncui;
    window.UI = UI;
    window.UI.closeConnectPanel();
    let res = await fetch("/api/container/kill", {
      method: "POST",
      body: JSON.stringify({
        id: img.substring(1),
        node: node,
        for: localStorage.username,
      }),
    });

    if (res.ok) {
      setTimeout(() => {
        document.location = "/";
      }, 500);
    } else {
      if (res.status == 429) {
        alert("You have reached your global rate limit.");
        document.location = "/";
      }
      window.UI.showStatus(
        "Failed to kill container. Trying again...",
        "error",
        1000,
      );
      setTimeout(() => {
        killContainer();
      }, 1100);
    }
  })();
}
function restartContainer() {
  intentionalDisconnect = false;
  (async () => {
    window.UI.disconnect();

    document.querySelector(".connectingOverlay h2").innerText = "Restarting...";
    let UI = document.querySelector("iframe.vnc").contentWindow.novncui;
    window.UI = UI;
    setTimeout(() => {
      window.UI.showStatus("Restarting container...", "success", 3000);
      window.UI.closeConnectPanel();
    }, 300);

    let res = await fetch("/api/container/restart", {
      method: "POST",
      body: JSON.stringify({
        id: img.substring(1),
        node: node,
        for: localStorage.username,
      }),
    });
    if (res.ok) {
      document.querySelector(".connectingOverlay h2").innerText =
        "Connecting...";
      setTimeout(() => {
        window.UI.connect();
      }, 3000);
    } else {
      if (res.status == 429) {
        alert("You have reached your global rate limit.");
        document.location = "/";
      }
      window.UI.connect();

      setTimeout(() => {
        document.querySelector(".connectingOverlay h2").innerText =
          "Failed to restart container. Trying again...";
        window.UI.showStatus(
          "Failed to restart container. Trying again...",
          "error",
          1000,
        );
        setTimeout(() => {
          restartContainer();
        }, 1100);
      }, 1000);
    }
  })();
}

function toggleFullScreen() {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  } catch (e) {
    window.UI.showStatus(e, "error");
  }
}
