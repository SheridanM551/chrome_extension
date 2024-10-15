// 創建右鍵選單項目
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "imageDetect",
        title: "檢測",
        contexts: ["image"]
    });
});

// 當使用者點擊選單時執行的功能
chrome.contextMenus.onClicked.addListener((info, tab) => {
if (info.menuItemId === "imageDetect") {
    const imageUrl = info.srcUrl;  // 擷取圖片的 URL

    // 創建一個小視窗顯示正在辨識
    chrome.windows.create({
        url: "popup.html",  // 指向我們的 loading 視窗
        type: "popup",
        width: 400,
        height: 300
    }, (newWindow) => {
        // 模擬一個 request 回應，假設兩秒後完成辨識
        setTimeout(() => {
            // 這裡可以將假設的結果傳給視窗
            chrome.runtime.sendMessage({ message: "辨識完成", result: "假影像" });
        }, 2000); // 模擬辨識過程
    });
}
});

