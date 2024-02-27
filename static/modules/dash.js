(async () => {
  if (localStorage["DEBLOKAUTH"] != undefined) {
    let tkncheck = await fetch("/api/auth/tokenvalidate", {
      method: "POST",
      body: localStorage["DEBLOKAUTH"],
    });
    if (tkncheck.ok) {
    } else {
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
<span class="flex flex-row">
<img class="!max-h-14 !max-w-14 !w-14 !h-14 item-img duration-300" style="border-radius:9999px;" src="${card.img}">
<span class="flex flex-col">
<h3 class="ml-5 mt-1 text-xl font-semibold item-title">${card.title}</h3>
<span class="opacity-50 mx-5 bottom-text text-sm">${card.subtitle}</span>
</span>
</span>
   `;

    cardElement.innerHTML = innerContent;

    cardContain.appendChild(cardElement);
  });
}
function itemModal(title, description, icon,buttons = ["OK","Cancel"]) {
  document.body.innerHTML += `
  <div
      class="z-10 mx-auto my-auto justify-center align-middle items-center grid gap-2"
      id="cardContainer"
    ></div>
    <div
      id="item-modal"
      class="hidden fixed top-0 left-0 w-full h-full justify-center items-middle align-middle z-50"
    >
      <div class="relative w-fit max-w-4xl max-h-[50%]">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t"
          >
            <h3 class="text-xl font-medium text-gray-900">${title}</h3>
            <button
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="item-modal"
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
            <p class="text-base leading-relaxed text-gray-500">${description}</p>
          </div>
          <!-- Modal footer -->
          <div
            class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b"
          >
            <button
              data-modal-hide="item-modal"
              type="button"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center s:ring-blue-800"
            >
              I accept
            </button>
            <button
              data-modal-hide="item-modal"
              type="button"
              class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 s:ring-gray-700"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}
function itemModalHide() {
  document.querySelector("#item-modal").remove();
}
