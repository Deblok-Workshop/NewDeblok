async function onAuthClick() {}

export default (async()=>{
    setInterval(()=>{
        
        if (!document.querySelector("[role=\"alertdialog\"]")) {
        // @ts-expect-error
        document.querySelector(".auth-dialog-trigger").click()
        } else {
    // @ts-expect-error
    document.querySelector(".authtrigger").onclick = async (e:any)=>{
        e.preventDefault();
        await onAuthClick();
    }
        }
    },500)
})
