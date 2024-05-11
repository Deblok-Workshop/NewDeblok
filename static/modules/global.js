let tips = [
  "PROTIP: Please delete your sessions when you're finished using them!",
  "TIP: You should join our discord, discord.gg/surfskip",
  "PROTIP: Restart your session when you feel like its necessary to do so.",
  "COMMON SENSE: Deblok is NOT your PC.",
  "TIP: my cat doesnt want me to work",
  "Hello World!",
  `TIP: your ip: ${(() => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ip.jammingin.space", false);
    xhr.send();
    return xhr.responseText;
  })()}`,
  "TIP: Don't mine at night!",
  "CAUTION: DO NOT DUMB HERE! NO DUMB AREA.",
  "CAUTION: FISH",
  "watche me explod",
  "",
  "COMMON SENSE: go to school, dont be a loser",
  "hambugers are tasteful",
  "COMMON SENSE: never go to the school bathrooms",
  "COMMON SENSE: dont be THOSE minecraft youtubers",
  "PROTIP: don't put your phone in your microwave",
  "dont try to fall down stairs",
  "TIP: tide pods dont taste good",
  "TIP: bribes are legal if the sum of money is big enough",
  "this is government propaganda",
  "dont hit people with marbles",
  "TIP: if you have a 2013 Audi a5 convertible out in the parking lot its being towed",
  "TIP: Do people even read these?",
  "Also try VVVVVV!",
  "Also try Super Meat Boy!",
  "Also try Terraria!",
  "Also try Mount And Blade!",
  "Also try Project Zomboid!",
  "Also try World of Goo!",
  "Also try Limbo!",
  "Also try Pixeljunk Shooter!",
  "Also try Braid!",
  "Supercalifragilisticexpialidocious!",
  "As seen on TV!",
  "Awesome!",
  "100% pure!",
  "May contain nuts!",
  "More polygons!",
  "Moderately attractive!",
  "Limited edition!",
  "Flashing letters!",
  "It's here!",
  "Best in class!",
  "It's finished!",
  "Kind of dragon free!",
  "Excitement!",
  "More than 500 sold!",
  "One of a kind!",
  "0% Sugar",
];

setTimeout(() => {
  fetch("/api/healthcheck")
    .then((response) => {
      if (
        !response.ok ||
        !String(
          decodeURIComponent(response.headers.get("Content-Type")),
        ).startsWith("application/json")
      ) {
        if (response.status != 429) {
          const reason = !response.ok
            ? `The NewDeblok API is down, responded with HTTP ${response.status}`
            : `An unexpected MIME type was received: ${encodeURIComponent(response.headers.get("Content-Type"))}, are you sure NewDeblok API is running? (Is NewDeblok running on a static host by accident?)`;
          window.location.href = `/503_err.html#0|${encodeURIComponent(reason)}`;
        } else {
          window.location.href = `/503_err.html#2`;
        }
      }
    })
    .catch((error) => {
      window.location.href = `/503_err.html#0|${encodeURIComponent("Failed to fetch.")}`;
    });
}, 2000);

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
</div>`;

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
function logout() {
  localStorage["DEBLOKAUTH"] = undefined;
  document.location = "index.html";
}

document.body.style.backgroundImage = `url(${localStorage.bgUrl ?? "assets/bg.webp"})`