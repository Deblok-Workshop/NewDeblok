document.querySelector(".authtrigger")?.addEventListener("click",(e)=>{
    e.preventDefault()
})

setInterval(()=>{
    if (!document.querySelector("[role=\"alertdialog\"]")) {
    // @ts-expect-error
    document.querySelector(".auth-dialog-trigger").click()
    }
},500)