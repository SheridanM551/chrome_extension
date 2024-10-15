// 創建右鍵選單項目
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "imageDetect",
      title: "檢測",
      contexts: ["image"] // 這會讓選項只在右鍵點擊圖片時顯示
    });
  });
  
// 當使用者點擊選單時執行的功能
chrome.contextMenus.onClicked.addListener((info, tab) => {
if (info.menuItemId === "imageDetect") {
    const imageUrl = info.srcUrl;  // 擷取圖片的 URL

    // 可以在此進行後續處理（例如發送至後端或顯示在前端）
    console.log("擷取到的圖片 URL:", imageUrl);

    // 這裡可以開一個新的 tab 來顯示擷取的圖片（簡單的測試用途）
    chrome.tabs.create({ url: imageUrl });
}
});
  