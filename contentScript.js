// 定義判斷是否為新聞網頁的邏輯
function isNewsWebsite() {
    const url = window.location.href;

    // 判斷 URL 是否包含 "news"
    if (url.includes("news")) {
        return true;
    }

    // 判斷是否為已知的新聞網站域名
    const knownNewsDomains = [
        "udn.com",             // 聯合新聞網
        "chinatimes.com",       // 中時新聞網
        "tw.nextapple.com/",       // 蘋果日報
        "ettoday.net",          // ETtoday
        "storm.mg",             // 風傳媒
        "ltn.com.tw",           // 自由時報
        "news.yahoo.com.tw",    // Yahoo!奇摩新聞
        "hk01.com",             // 香港01
        "hket.com",             // 香港經濟日報
        "setn.com",             // 三立新聞網
        "tvbs.com.tw",          // TVBS新聞網
        "cna.com.tw",           // 中央通訊社
        "rthk.hk",              // 香港電台
        "mingpao.com",          // 明報
        "nownews.com"           // NOWnews 今日新聞
    ];

    if (knownNewsDomains.some(domain => url.includes(domain))) {
        return true;
    }

    // 判斷頁面中的 meta 標籤
    const metaTags = document.getElementsByTagName('meta');
    for (let tag of metaTags) {
        if (tag.getAttribute('property') === 'og:type' && tag.getAttribute('content') === 'article') {
            return true;
        }
    }

    return false;
}

// 如果是新聞網站，做出相應處理
if (isNewsWebsite()) {
    console.log("這是一個新聞網站！");

    // 可以在這裡觸發更多功能，比如顯示特定的 UI，或者發送訊息到 background.js
    chrome.runtime.sendMessage({ action: 'newsDetected', url: window.location.href });
}
