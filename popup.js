document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fileInput').addEventListener('change', function () {
        imagePreview = document.getElementById('image-preview');
        statusElement = document.getElementById('status');
        const file = fileInput.files[0];  // 選中的第一個文件
        if (file) {
            // 檢查是否為圖片類型
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                // 當文件讀取完成後，將其顯示在 img 中
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;  // 設定圖片的 Data URL
                    imagePreview.style.display = 'block';  // 顯示圖片
                    statusElement.innerText = '上傳完成';
                };

                // 讀取文件並轉換為 Data URL
                reader.readAsDataURL(file);
            }
        }
    });
    chrome.runtime.onMessage.addListener((message) => {
        imgElement = document.getElementById('image-preview');
        loaderElement = document.querySelector('.spinner');
        h2Element = document.querySelector('h2');
        fileInputElement = document.getElementById('fileInputDiv');
        statusElement = document.getElementById('status');

        fileInputElement.style.display = 'none';
        imgElement.style.display = 'none';
        loaderElement.style.display = 'none';

        if (message.action === 'UIshowSelectedImage') {
            h2Element.innerText = '右鍵選擇的圖片';
            statusElement.innerText = '辨識中...';
            loaderElement.style.display = 'block';

            chrome.storage.local.get('imageUrl', (result) => {
                if (result.imageUrl) {
                    // 顯示圖片縮圖
                    imgElement.src = result.imageUrl;
                    imgElement.style.display = 'block';
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
            h2Element.innerText = '手動截圖結果';
            statusElement.innerText = '辨識中...';
            loaderElement.style.display = 'block';

            chrome.storage.local.get(['screenshotUrl', 'selectionDetails'], (data) => {
                if (data.screenshotUrl && data.selectionDetails) {
                    const { screenshotUrl, selectionDetails } = data;
                    console.log("Screenshot and selection details found:", data);
                    cropScreenshot(screenshotUrl, selectionDetails).then((croppedImage) => {
                        imgElement.src = croppedImage;
                        imgElement.style.display = 'block';
                    });
                } else {
                    console.log("No screenshot data found.");
                    imgElement.alt = "Selected Screenshot not found";
                }
            });
        } else if (message.action === 'UIshowEntireScreenshot') {
            h2Element.innerText = '全螢幕截圖結果';
            statusElement.innerText = '辨識中...';
            loaderElement.style.display = 'block';

            if (message.screenshotData) {
                imgElement.src = message.screenshotData;
                imgElement.style.display = 'block';
            } else {
                console.error("No entire screenshot data found.");
                imgElement.alt = "EntireScreenshot not found";
            }
        } else if (message.action === 'UIUploadFile') {
            h2Element.innerText = '上傳檔案';
            statusElement.innerText = '等待檔案上傳...';
            fileInputElement.style.display = 'block';
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

