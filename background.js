// // 데이터 저장 예시
// // var valueToSave = 'value'; // 저장할 값 정의
// chrome.storage.local.set({key: 'value'}, function() {
//   fetch('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukTot.do', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({})
//   })
//     .then(response => response.json())
//     .then(jsonData => {
//       // gyoyangTable 함수 호출하여 테이블 업데이트
//       checkScoreTable(jsonData);
//     })
//     .catch(error => {
//       console.error('Error fetching data:', error);
//     });
//   console.log('Value is set to ' + valueToSave); // 수정된 부분
// });


  

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
      case "전자공학과":
        openNewTab("html/electronic.html", message.hakbun);
        break;
      case "경영학부":
        openNewTab("html/business.html", message.hakbun);
        break;
      default:
        console.log("해당 학과 정보를 처리할 수 없습니다.");
    }
  } else {
    console.log("알 수 없는 액션입니다.");
  }
});

