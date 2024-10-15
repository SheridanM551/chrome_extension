chrome.runtime.onMessage.addListener((message) => {
    if (message.message === "辨識完成") {
      document.querySelector(".loader").style.display = "none";
      document.querySelector("#result").style.display = "block";
      document.querySelector("#result").textContent = "辨識結果: " + message.result;
    }
  });