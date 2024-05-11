(async () => {
  if (localStorage["DEBLOKAUTH"] != undefined) {
    let tkncheck = await fetch("/api/auth/tokenvalidate", {
      method: "POST",
      body: localStorage["DEBLOKAUTH"],
    });
    if (tkncheck.status == 429) {
      window.location.href = `/503_err.html#2`;
    } else if (!tkncheck.ok) {
      document.location = "login.html";
    }
  } else {
    document.location = "login.html";
  }
})();

if (localStorage["DEBLOKAUTH"] != undefined) {
  // Get a reference to the card container element
  const cardContain = document.querySelector("#cardContainer");

  cardData.forEach((card) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card"); // this is shit

    const innerContent = `
    <div onclick="item('${card.title}', '${card.description}','${card.img}',['Launch'],'${card.name}');">
<span class="flex flex-row">
<img class="!max-h-14 !max-w-14 !w-14 !h-14 item-img duration-300" style="border-radius:9999px;" src="${card.img}">
<span class="flex flex-col">
<h3 class="ml-5 mt-1 text-xl font-semibold item-title">${card.title}</h3>
<span class="opacity-50 mx-5 bottom-text text-sm">${card.subtitle}</span>
</span>
</span>
</div>
   `;

    cardElement.innerHTML = innerContent;

    cardContain.appendChild(cardElement);
  });
}
function item(
  title,
  description,
  icon,
  buttons = ["OK", "Cancel"],
  launchSession = "",
) {
  (() => {
    window.btnReturn = "";
    itemModal(title, description, icon, buttons);
    let b = setInterval(() => {
      if (window.btnReturn == "clickedbtn0" && launchSession != "") {
        makeSession(launchSession);
        clearInterval(b);
      }
    }, 150);
  })();
}
function itemModal(title, description, icon, buttons = ["OK", "Cancel"]) {
  //setTimeout(()=>{
  document.body.innerHTML += `
  
    <div
      id="item-modal"
      class="fixed top-0 left-0 w-full h-full justify-center self-center items-middle align-middle z-50 flex flex-col bg-black __animModal"
    >
      <div class=" w-full max-h-[50%] ">
        <!-- Modal content -->
        <div class="__modalContent min-w-sm w-fit mx-auto relative bg-mantle rounded-lg shadow-md shadow-black/40 __animModal2">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b border-black/20 rounded-t"
          >${icon ? `<icon class="w-8 h-8 inline-block mr-2" style="background-image:url(${icon ? icon : ""});background-size:cover;"> </icon>` : ""}
            
          <h3 class="text-xl font-medium text-text">${title}</h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onclick="window.btnReturn = 'closed';itemModalHide();"
            >
              <svg
                class="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5 space-y-4">
            <p class="text-base leading-relaxed text-text/80 w-fit mx-auto">${description}</p>
          </div>
          <!-- Modal footer -->
          <div
            class="bg-black/20 justify-evenly flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-black/40 rounded-b"
          >
            <button
              onclick="window.btnReturn = 'clickedbtn0';itemModalHide();"
              type="button"
              class="text-white xpbtn-if-theme bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center s:ring-blue-800"
            >
              ${buttons[0]}
            </button>
            ${
              buttons[1]
                ? `
            <button
              type="button"
              onclick="window.btnReturn = 'clickedbtn1';itemModalHide();"
              class="py-2.5 xpbtn-if-theme px-5 ms-3 text-sm font-medium text-text focus:outline-none bg-base rounded-lg border border-black/40 hover:bg-surface0 hover:text-blue focus:z-10 focus:ring-4 focus:ring-gray-100 s:ring-gray-700"
            >
              ${buttons[1]}
            </button>
            `
                : ``
            }
            
          </div>
        </div>
      </div>
    </div>
  `;
  //},200)
}
function itemModalHide() {
  document.querySelector("#item-modal").classList.remove("__animModal");
  document.querySelector("#item-modal").classList.add("__animModalEnd");
  document
    .querySelector("#item-modal .__modalContent")
    .classList.remove("__animModal2");
  document
    .querySelector("#item-modal .__modalContent")
    .classList.add("__animModal2End");
  setTimeout(() => {
    document.querySelector("#item-modal").remove();
  }, 320);
}
function makeSession(container) {
  (async () => {
    let res = await fetch("/api/container/create", {
      method: "POST",
      body: JSON.stringify({ name: container, for: localStorage["username"] }),
    });
    let resp = await res.text(); //this is for error handling
    let rj = JSON.parse(resp); 
    if (res.ok && !rj.returned.includes("{")) {
      document.location = `vnc.html#${rj.returned};${rj.port.split(":")[0]};${rj.fromNode};`;
    } else {
      itemModal(
        "Error",
        `The session failed to start: \n<br><b>HTTP ${res.status} (ok? ${res.ok})</b><br><code style="max-width:480px;">${resp}</code>\n`,
        "",
        ["Close"],
      );
      return;
    }
  })();
}

setTimeout((async ()=> {
  let res = await fetch(`/api/auth/getuserinfo/${localStorage.username}`)
  document.querySelector(".displayName").innerText = (await res.json()).displayName
  }),50)