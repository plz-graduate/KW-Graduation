
  

// background.js
function openNewTab(url, hakbun) {
  const newURL = `${url}?hakbun=${hakbun}`;
  chrome.tabs.create({ url: newURL });
}
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("백그라운드");

  if (message.action === "openNewTab") {
    switch(message.hakgwa) {
      case "정보융합학부":
        console.log("정융 백그라운드 도착");
        openNewTab("html/informationConvergence.html", message.hakbun);
        break;
      case "컴퓨터정보공학부":
        openNewTab("html/computer_science.html", message.hakbun);
        break;
      case "소프트웨어학부":
      case "로봇학부":
      case "전자통신공학과":
        openNewTab("html/mathematics.html", message.hakbun);
        break;
      default:
        console.log("해당 학과 정보를 처리할 수 없습니다.");
    }
  } else {
    console.log("알 수 없는 액션입니다.");
  }
});

