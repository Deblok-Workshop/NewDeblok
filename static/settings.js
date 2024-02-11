function checkbox_check(ele) {
  let ifsect = ele.parentElement.querySelector(".if-section");
  if (ifsect != undefined) {
    ifsect.classList.toggle("opacity-50");
    ifsect.classList.toggle("active");
  }
}
function changeTheme(ele) {
  themetxt = ele.innerText.toLowerCase();
  console.log(themetxt);
  localStorage["themeSelected"] = themetxt;
  updateTheme();
}
