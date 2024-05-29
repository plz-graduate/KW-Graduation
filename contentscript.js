// 버튼 생성 및 스타일 설정
var button = document.createElement("button");
button.textContent = "졸업 가능 확인";
button.style.padding = "10px";
button.style.backgroundColor = "white";
button.style.color = "gray";

// 버튼 클릭 이벤트 핸들러
button.addEventListener("click", function () {
  fetch("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      const hakgwa = jsonData.hakgwa.split(" ")[0];
      const hakbun = jsonData.hakbun.toString().slice(2, 4);
      switch (hakgwa) {
        case "정보융합학부":
          chrome.runtime.sendMessage({
            action: "openNewTab",
            hakgwa: "정보융합학부",
            hakbun: hakbun,
          });
          break;
        case "전자공학과":
          chrome.runtime.sendMessage({
            action: "openNewTab",
            hakgwa: "전자공학과",
            hakbun: hakbun,
          });
          break;
        case "소프트웨어학부":
          chrome.runtime.sendMessage({
            action: "openNewTab",
            hakgwa: "소프트웨어학부",
            hakbun: hakbun,
          });
          break;
        default:
          console.log("해당 학과 정보를 찾을 수 없습니다.");
      }
    });
});

var button1 = document.createElement("button");
button1.textContent = "성적 계산기";
button1.style.padding = "10px";
button1.style.backgroundColor = "white";
button1.style.color = "#3a051f";
button1.style.border = "none";
button1.style.borderRadius = "10px";

button1.addEventListener("click", function () {
  fetch("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      const hakbun = jsonData.hakbun.toString().slice(2, 4);
      chrome.runtime.sendMessage({
        action: "openNewTab",
        hakgwa: "성적계산기",
        hakbun: hakbun,
      });
    });
});

// 버튼을 삽입할 요소 선택
var targetElement = document.querySelector(".col-md-6.navtxt");
if (targetElement) {
  targetElement.prepend(button1); // 성적 계산기 버튼 먼저 삽입
  targetElement.prepend(button); // 졸업 가능 확인 버튼 다음 삽입
}
