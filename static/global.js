function updateTheme() {
    if (localStorage['themeSelected'] != undefined) {
        document.querySelector('html').className = (localStorage['themeSelected'])
    }
}
updateTheme()