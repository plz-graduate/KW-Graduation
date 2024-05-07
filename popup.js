document.addEventListener('DOMContentLoaded', function() {
    // 현재 활성 탭에 컨텐츠 스크립트를 주입
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['contentscript.js']
        });
    });

    // 컨텐츠 스크립트로부터 계산 결과를 받는 메시지 리스너
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.type === "calculationResult") {
            // 메시지 유형이 계산 결과일 때 DOM 업데이트
            document.getElementById('average').textContent = `2023학년도 2학기 평균: ${message.data}`;
        }
    });
});
