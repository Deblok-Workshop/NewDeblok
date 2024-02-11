 // Get a reference to the card container element
 const cardContainer = document.getElementById('cardContainer');

 // Define the data for the cards
 const cardData = [
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   {
     imageSrc: 'assets/icons/firefox.png',
     title: 'Firefox',
     subtitle: 'Browser',
   },
   // this is chatgpt
 ];

 cardData.forEach((card) => {
   const cardElement = document.createElement('div');
   cardElement.classList.add(
     'h-[96px]',
     'w-[300px]',
     'bg-surface0',
     '!rounded-lg', "mb-1",
     'p-3',
     'hover:bg-surface1',
     'duration-300',
     'hover:shadow-lg',
     'hover:ring-2',
     'ring-blue-500'
   );

   const innerContent = `
     <span class="flex flex-row">
       <img class="!max-h-14 !max-w-14 !w-14 !h-14 item-img" src="${card.imageSrc}">
       <span class="flex flex-col">
         <h3 class="ml-5 mt-2 text-2xl font-semibold item-title">${card.title}</h3>
         <span class="opacity-50 mx-5 bottom-text">${card.subtitle}</span>
       </span>
     </span>
   `;

   cardElement.innerHTML = innerContent;

   cardContainer.appendChild(cardElement);
 });