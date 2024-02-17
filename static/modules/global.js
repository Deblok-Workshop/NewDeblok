// add logout modal to everything
document.body.innerHTML += `    <div id="popup-modal" class="hidden w-full h-full fixed bg-black/50 z-[6000]">
<div class=" flex justify-center align-middle w-full h-full">

<div class="relative p-4 w-full max-w-md max-h-fit flex align-middle items-center">
  <div
    class="relative duration-[250ms] rounded-lg bg-base shadow-md shadow-black/50 h-fit px-10"
  >
    <button
      type="button"
      class="absolute top-3 end-2.5 text-text bg-transparent hover:text-mantle rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-overlay0"
      data-modal-hide="popup-modal"
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
    <div class="p-4 md:p-5 text-center">
      <svg
        class="mx-auto mb-4 text-gray-400 w-12 h-12"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <h3 class="mb-5 text-lg font-normal text-text">
        Are you sure you want to log out?
      </h3>
      <button
        data-modal-hide="popup-modal"
        type="button"
        onclick="logout()"
        class="text-text bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-sm inline-flex duration-[250ms] items-center px-5 py-2.5 text-center my-2"
      >
        Yes, I'm sure
      </button>
      <button
        data-modal-hide="popup-modal"
        type="button"
        class="text-text focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 hover:text-overlay1 focus:z-10 duration-[250ms] bg-surface0 border-overlay0 hover:bg-gray-600 focus:ring-base"
      >
        No, cancel
      </button>
    </div>
  </div>
</div>
</div>
</div>`

function updateTheme() {
  if (localStorage["themeSelected"] == "horrible latte") {
    document.querySelector("html").className = "latte";
    document.querySelector("body").classList.add("horrible");
  } else if (localStorage["themeSelected"] != undefined) {
    document.querySelector("html").className = localStorage["themeSelected"];
    document.querySelector("body").classList.remove("horrible");
  }
}
updateTheme();
function logout() {localStorage["DEBLOKAUTH"] = undefined; document.location="index.html"}