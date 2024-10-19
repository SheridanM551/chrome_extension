chrome.runtime.onInstalled.addListener(() => {
    // 先移除所有現有的 contextMenus 項目，避免重複創建
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "imageDetect",
            title: "檢測圖片",
            contexts: ["image"]
        });
        chrome.contextMenus.create({
            id: "checkSafety",
            title: "檢查網站安全性",
            contexts: ["page", "link"]
        });
        chrome.contextMenus.create({
            id: "CaptureEntirescreen",
            title: "全頁截圖",
            contexts: ["page", "all"]
        });
        chrome.contextMenus.create({
            id: "selectArea",
            title: "手動截圖",
            contexts: ["all"]
        });
        chrome.contextMenus.create({ // Modified
            id: "AutoDetect",
            title: "全頁自動檢測",
            contexts: ["all"]
        });
        chrome.contextMenus.create({
            id: "uploadFile",
            title: "上傳檔案",
            contexts: ["all"]
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

        fetch('http://localhost:3000/detectUrl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl: imageUrl })
        })
        .then(response => response.json())
        .then(data => {
            console.log('伺服器回應:', data);
            if (data.status === 'success') {
                chrome.storage.local.set({ recognitionResult: data }, () => {
                    console.log('辨識結果已儲存:', data);

                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "檢測完成",
                        message: data.message
                    });
                }); 
            } else {
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "檢測錯誤",
                    message: "檢測失敗，請稍後再試"
                });
            }
        })
        .catch(error => {
            console.error('伺服器請求錯誤:', error);
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "錯誤",
                message: "伺服器錯誤，請稍後再試"
            });
        });        

        // 可以在這裡進行實際的模型推理或伺服器請求
        console.log("正在辨識圖片:", imageUrl);
        chrome.action.openPopup(() => {
            chrome.runtime.sendMessage({ action: "UIshowSelectedImage"});
        }); 

    }
    else if (info.menuItemId === "checkSafety") {
        const urlToCheck = tab.url;
        console.log("正在檢查網站安全性:", urlToCheck);
        // 發送請求到 VirusTotal API
        fetch(`https://www.virustotal.com/api/v3/urls/${btoa(urlToCheck)}`, {
            method: "GET",
            headers: {
                "x-apikey": "5f4e6f792a0eed9953575c45481384c0441cd31e552da7e73c1ac633d534bc62"
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
                        }, function (notificationId) {
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
    } else if (info.menuItemId === "selectArea") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            chrome.tabs.sendMessage(tab.id, { action: "startSelection" });
            console.log("Message sent to content.js to start selection");
        });
    } else if (info.menuItemId === "CaptureEntirescreen") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            else {
                chrome.action.openPopup(() => {
                    chrome.runtime.sendMessage({ action: "UIshowEntireScreenshot", screenshotData: dataUrl });
                });
            }
        });
    } else if (info.menuItemId === "AutoDetect") { // Modified
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            chrome.tabs.sendMessage(tab.id, { action: 'AutoDetect' });
            console.log("Message sent to auto-detect.");
        });
    } else if (info.menuItemId === "uploadFile") {
        chrome.action.openPopup(() => {
            chrome.runtime.sendMessage({ action: "UIUploadFile"});
        });
    }
});

// Handle messages from content.js and capture the screenshot
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureScreenshot') {
        const selectionDetails = message.selectionDetails; // The selected area details
        console.log("Selection details received:", selectionDetails);

        // Check if selectionDetails is undefined or invalid
        if (!selectionDetails || !selectionDetails.width || !selectionDetails.height) {
            console.error("Selection details are missing or invalid:", selectionDetails);
            return;
        }

        // Capture the visible part of the tab
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (screenshotUrl) => {

            console.log("Screenshot captured:", screenshotUrl);
            
            fetch('http://localhost:3000/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: screenshotUrl })
            })
            .then(response => response.json())
            .then(data => {
                console.log('伺服器回應:', data);
                if (data.status === 'success') {
                    chrome.storage.local.set({ recognitionResult: data }, () => {
                        console.log('辨識結果已儲存:', data);

                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "icon.png",
                            title: "檢測完成",
                            message: data.message
                        });
                    }); 
                } else {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "icon.png",
                        title: "檢測錯誤",
                        message: "檢測失敗，請稍後再試"
                    });
                }
            })
            .catch(error => {
                console.error('伺服器請求錯誤:', error);
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon.png",
                    title: "錯誤",
                    message: "伺服器錯誤，請稍後再試"
                });
            });


            chrome.storage.local.set({ screenshotUrl, selectionDetails }, () => {
                console.log("Screenshot data stored.");
                chrome.action.openPopup(() => {
                    chrome.runtime.sendMessage({ action: "UIshowSelectedScreenshot"});
                }); 
            });
        });
    } else if (message.action === "captureEntireScreenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            console.log("Screenshot captured:", dataUrl);        
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError });
            } else {
                sendResponse({ success: true, dataUrl: dataUrl });
            }
        });
        return true;
    } else if (message.action === 'InformationCaptured') { //Modified
        console.log("Information captured:", message.imageUrls);
        // TODO: Handle the image URLs here
    }
});
