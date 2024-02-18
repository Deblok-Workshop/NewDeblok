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
function itemModal(title,description) {

}