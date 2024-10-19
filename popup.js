document.addEventListener('DOMContentLoaded', function () {
    console.log("Popup opened. Retrieving data...");

    // Get the screenshot URL and selection details from chrome.storage.local
    chrome.storage.local.get(['screenshotUrl', 'selectionDetails'], (data) => {
        if (data.screenshotUrl && data.selectionDetails) {
            const { screenshotUrl, selectionDetails } = data;
            console.log("Screenshot and selection details found:", data);
            // Perform cropping in the popup
            cropScreenshot(screenshotUrl, selectionDetails).then((croppedImage) => {
                document.getElementById('image-preview').src = croppedImage;
                
            });
        } else {
            console.log("No screenshot data found.");
            document.body.textContent = "No screenshot captured. Please select an area.";
        }
    });
    
    chrome.storage.local.get('imageUrl', (result) => {
        if (result.imageUrl) {
            // 顯示圖片縮圖
            document.getElementById('image-preview').src = result.imageUrl;
            console.log('popup.js: startRecognition, imageUrl:', result.imageUrl);
            // 模擬辨識時間
            setTimeout(() => {
                // 辨識結束，更新狀態
                document.querySelector('.spinner').style.display = 'none';
                document.getElementById('status').innerText = '辨識完成：這是一張假影像！';
            }, 3000); // 模擬3秒後完成辨識
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

            const adjustedX = selection.x * dpr;
            const adjustedY = selection.y * dpr;
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

