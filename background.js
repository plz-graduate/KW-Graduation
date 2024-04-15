// background script에서 메시지 수신
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // 메시지 타입 확인 후 처리
    if (message.action === "openNewTab") {
      // 새로운 탭 열기
      chrome.tabs.create({ url: chrome.runtime.getURL("newpage.html") });
    }
  });
  