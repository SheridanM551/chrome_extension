document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener((message) => {
        imgElement = document.getElementById('image-preview');
        if (message.action === 'UIshowSelectedImage') {
            chrome.storage.local.get('imageUrl', (result) => {
                if (result.imageUrl) {
                    // 顯示圖片縮圖
                    imgElement.src = result.imageUrl;
                    console.log('popup.js: startRecognition, imageUrl:', result.imageUrl);
                    // 模擬辨識時間
                    setTimeout(() => {
                        // 辨識結束，更新狀態
                        document.querySelector('.spinner').style.display = 'none';
                        document.getElementById('status').innerText = '辨識完成：這是一張假影像！';
                    }, 3000); // 模擬3秒後完成辨識
                }
            });
        } else if (message.action === 'UIshowSelectedScreenshot') {
            chrome.storage.local.get(['screenshotUrl', 'selectionDetails'], (data) => {
                if (data.screenshotUrl && data.selectionDetails) {
                    const { screenshotUrl, selectionDetails } = data;
                    console.log("Screenshot and selection details found:", data);
                    cropScreenshot(screenshotUrl, selectionDetails).then((croppedImage) => {
                        imgElement.src = croppedImage;
                    });
                } else {
                    console.log("No screenshot data found.");
                    imgElement.alt = "Selected Screenshot not found";
                }
            });
        } else if (message.action === 'UIshowEntireScreenshot') {
            if (message.screenshotData) {
                imgElement.src = message.screenshotData;
            } else {
                console.error("No entire screenshot data found.");
                imgElement.alt = "EntireScreenshot not found";
            }
        }
    });
});


function cropScreenshot(screenshotUrl, selection) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = screenshotUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Adjust selection details based on device pixel ratio (DPR)
            const dpr = window.devicePixelRatio;

            const adjustedX = (selection.x - window.scrollX) * dpr;
            const adjustedY = (selection.y - window.scrollY) * dpr;
            const adjustedWidth = selection.width * dpr;
            const adjustedHeight = selection.height * dpr;

            canvas.width = adjustedWidth;
            canvas.height = adjustedHeight;

            // Draw the selected portion of the screenshot on the canvas
            ctx.drawImage(img, adjustedX, adjustedY, adjustedWidth, adjustedHeight, 0, 0, adjustedWidth, adjustedHeight);

            // Return the cropped image as a base64 URL
            resolve(canvas.toDataURL('image/png'));
        };
    });
}

