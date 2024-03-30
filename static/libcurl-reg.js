
// Libcurl INIT (TODO: Add the actual import and setup websocketing)
const libcurlload = () => {
    // @ts-expect-error stfu
    window.parent.tb.libcurl.load_wasm("https://cdn.jsdelivr.net/npm/libcurl.js@v0.6.7/libcurl.wasm");
    // @ts-expect-error stfu
    this.set_websocket(`${location.protocol.replace("http", "ws")}//${location.hostname}:${location.port}/wisp/`);        
}
document.addEventListener("libcurl_load", libcurlload);
libcurlload()