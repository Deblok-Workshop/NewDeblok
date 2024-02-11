function updateTheme() {
    if (localStorage['themeSelected'] == "horrible latte") {
        document.querySelector('html').className = "latte"
        document.querySelector('body').classList.add('horrible')
    }
    else if (localStorage['themeSelected'] != undefined) {
        document.querySelector('html').className = (localStorage['themeSelected'])
        document.querySelector('body').classList.remove('horrible')
    }
}
updateTheme()