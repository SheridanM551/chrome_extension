document.addEventListener('DOMContentLoaded', function () {
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
