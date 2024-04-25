var button = document.createElement("button");
  button.textContent = "졸업 가능 확인";

  // 버튼 스타일 설정 (예시)
  button.style.padding = "10px";
  button.style.backgroundColor = "white";
  button.style.color = "gray";

  // 버튼을 삽입할 요소 선택 (예시: 클래스 이름이 "col-md-6 navtxt"인 요소)
  var targetElement = document.querySelector(".col-md-6.navtxt");
  
  // 요소에 버튼 삽입
  if (targetElement) {
    targetElement.prepend(button);
  }
   

// // 버튼 클릭 이벤트 리스너 추가
// button.addEventListener("click", function() {
//   chrome.runtime.sendMessage({ action: "openNewTab" });
// });




// button.addEventListener("click", function() {
//   // hakgwa 정보에 따라 실행할 JavaScript 파일을 결정합니다.
//   if (hakgwa === "정보융합학부") {
//     // 정보융합학부에 해당하는 JavaScript 파일을 실행합니다.
//     chrome.runtime.sendMessage({ action: "openNewTab", hakgwa: "정보융합학부" });
//   } else {
//     // 다른 경우에는 다른 JavaScript 파일을 실행할 수 있도록 분기 처리합니다.
//     chrome.runtime.sendMessage({ action: "openNewTab", hakgwa: "다른학과" });
//   }
// });

// 버튼 클릭 이벤트 핸들러
button.addEventListener("click", function() {
  // fetch 요청을 통해 학과 정보 가져오기
  fetch('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  })
    .then(response => response.json())
    .then(jsonData => {
      const hakgwa = jsonData.hakgwa.split(' ')[0]; 
      const hakbun = jsonData.hakbun.toString().slice(2, 4);
      console.log(hakgwa)
      console.log(hakbun)
      // 학과별로 다른 동작 수행
      switch(hakgwa) {
        case "정보융합학부":
          console.log("정융 백그라운드 보내기");
          // 정보융합학부에 해당하는 JavaScript 파일을 실행합니다.
          chrome.runtime.sendMessage({ action: "openNewTab", hakgwa: "정보융합학부", hakbun: hakbun});
          break;
        case "컴퓨터정보공학부":
          // 컴퓨터학과에 해당하는 JavaScript 파일을 실행합니다.
          chrome.runtime.sendMessage({ action: "openNewTab", hakgwa: "컴퓨터정보공학부",hakbun: hakbun });
          break;
        case "소프트웨어학부":
          // 수학과에 해당하는 JavaScript 파일을 실행합니다.
          chrome.runtime.sendMessage({ action: "openNewTab", hakgwa: "소프트웨어학부",hakbun: hakbun });
          break;
        // 다른 학과에 대한 처리를 추가할 수 있습니다.
        default:
          // 기본 동작은 예를 들어 경고 메시지를 표시하거나 다른 동작을 수행할 수 있습니다.
          console.log("해당 학과 정보를 찾을 수 없습니다.");
      }
      })
});






// //학과 긁어오고 버튼 누르면 해당 학과 js 파일 실행되게 하기
// fetch('https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({})
// })
//   .then(response => response.json())
//   .then(jsonData => {
//     const hakgwa = jsonData.hakgwa.split(' ')[0]; // 공백을 기준으로 문자열을 분리하고 첫 번째 부분을 선택합니다.
//     console.log(hakgwa); //ex. 정보융합학부 출력
// })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//   });