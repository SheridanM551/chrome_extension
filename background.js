chrome.runtime.onInstalled.addListener(() => {
    // 先移除所有現有的 contextMenus 項目，避免重複創建
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "imageDetect",
            title: "檢測",
            contexts: ["image"]
        });
        chrome.contextMenus.create({
            id: "checkSafety",
            title: "檢查網站安全性",
            contexts: ["page", "link"]
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "imageDetect") {
        const imageUrl = info.srcUrl;

        // 存儲圖片 URL 到 localStorage 中
        chrome.storage.local.set({ imageUrl: imageUrl }, () => {
            console.log("圖片 URL 已儲存:", imageUrl);
        });

        // 可以在這裡進行實際的模型推理或伺服器請求
        console.log("正在辨識圖片:", imageUrl);
    }
    else if (info.menuItemId === "checkSafety") {
        const urlToCheck = tab.url;
        console.log("正在檢查網站安全性:", urlToCheck);
        // 發送請求到 VirusTotal API
        fetch(`https://www.virustotal.com/api/v3/urls/${btoa(urlToCheck)}`, {
            method: "GET",
            headers: {
                "x-apikey": "5f4e6f792a0eed9953575c45481384c0441cd31e552da7e73c1ac633d534bc62" // 替換為你自己的 VirusTotal API Key
                // cd16ef6437d517e4cec6d6ad5c9033b060633d83c4e18a2811f1cf3353743123
                // 5f4e6f792a0eed9953575c45481384c0441cd31e552da7e73c1ac633d534bc62
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("VirusTotal API 回應:", data);
            // if error (API return error message)
            if (data.error) {
                chrome.notifications.create(
                    {
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "錯誤",
                    message: data.error.message
                }, function(notificationId) {
                    if (chrome.runtime.lastError) {
                        console.error("通知創建失敗：", chrome.runtime.lastError.message);
                    } else {
                        console.log("通知已創建，ID：", notificationId);
                    }
                });
            }
            else if (data.data.attributes.last_analysis_stats.malicious > 0) {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "風險警告",
                    message: "這個網站可能不安全！"
                });
            } else {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "安全",
                    message: "這個網站看起來很安全！"
                });
            }
        });
    }
});
