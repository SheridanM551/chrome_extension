(function() {
    // for screenshot capture
    let selectionBox = null, startX, startY, isSelecting = false;

    // Start the selection mode
    function enableSelectionMode() {

        console.log("Selection mode enabled.");
        
        document.body.style.cursor = 'crosshair';  // Change the cursor to indicate selection
        // Add event listeners for the selection process
        document.addEventListener('mousedown', startSelection);
        document.addEventListener('mousemove', updateSelection);
        document.addEventListener('mouseup', endSelection);
    }

    // Start the selection by creating a selection box
    function startSelection(event) {
        isSelecting = true;
        startX = event.pageX;
        startY = event.pageY;

        selectionBox = document.createElement('div');
        selectionBox.style.position = 'absolute';
        selectionBox.style.border = '2px dashed #000';
        selectionBox.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        document.body.appendChild(selectionBox);
    }

    // Update the selection box size and position based on mouse movement
    function updateSelection(event) {
        if (!isSelecting) return;

        const currentX = event.pageX;
        const currentY = event.pageY;

        selectionBox.style.width = `${Math.abs(currentX - startX)}px`;
        selectionBox.style.height = `${Math.abs(currentY - startY)}px`;
        selectionBox.style.left = `${Math.min(startX, currentX)}px`;
        selectionBox.style.top = `${Math.min(startY, currentY)}px`;
    }

    function endSelection(event) {
        isSelecting = false;
        document.body.style.cursor = 'default';

        // Remove the event listeners after selection ends
        document.removeEventListener('mousedown', startSelection);
        document.removeEventListener('mousemove', updateSelection);
        document.removeEventListener('mouseup', endSelection);

        const endX = event.pageX;
        const endY = event.pageY;

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const selectionDetails = {
            x: Math.min(startX, endX) - scrollX,
            y: Math.min(startY, endY) - scrollY,
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY)
        };

        console.log("Selection details with scroll adjustment:", selectionDetails);

        // Send the selected area details to background.js to capture the screenshot
        chrome.runtime.sendMessage({ action: 'captureScreenshot', selectionDetails });

        // Remove the selection box from the DOM
        if (selectionBox) selectionBox.remove();
    }

    // Listen for the message from background.js to start the selection mode
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.action === 'startSelection') {
            enableSelectionMode();
        }
    });
})();
// Modified
function getAllImages(tabId) {
    const images = document.querySelectorAll('img'); // Select all <img> elements
    const imageUrls = Array.from(images).map(img => img.src); // Extract the src attribute from each image

    console.log("Images found on the page:", imageUrls);

    chrome.runtime.sendMessage({ action: 'InformationCaptured', imageUrls , tabId});
}

// Modified
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'LabelFakeImages') {
        console.log("開始標記假圖片CSS...");
        const fakeImages = message.fakeImages;
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (fakeImages.includes(img.src)) {
                img.style.border = '5px solid red'; // Highlight fake images with a red border
                console.log("假圖片CSS已標記:", img.src);
            }
        });
    }
});

function createStyle() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    img.fake {
        border: 5px solid red;
        opacity: 0.5;
        filter: blur(5px);
        position: relative;
    }

    img.fake::after {
        content: "假圖片";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: red;
        background-color: rgba(255, 255, 255, 0.7);
        padding: 5px;
        border-radius: 5px;
        z-index: 10;
    }
    `;
    document.head.appendChild(style);  // 添加到 <head> 中

}
// Modified
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'startAutoDetect') {
        getAllImages(message.tabId);
    } 
});

