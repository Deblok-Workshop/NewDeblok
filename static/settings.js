function checkbox_check(ele) {
    let ifsect = ele.parentElement.querySelector('.if-section')
     if (ifsect != undefined) {
        ifsect.classList.toggle('opacity-50')
        ifsect.classList.toggle('active')
     }
}