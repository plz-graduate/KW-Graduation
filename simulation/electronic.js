document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["key"], function (result) {
      console.log("Value currently is " + result.key);
    });
  });
  
  var globalHakbun;
  let gipilData = {};
  let geanpilData = {};
  
  //학번 추출해서 전역변수로 만드는 함수
  function getHakbunFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
  
    return urlParams.get("hakbun");
  }
  
  let majorCredits, totalCredits;
  document.addEventListener("DOMContentLoaded", function () {
    fetch("../data/electronic.json")
      .then((response) => response.json())
      .then((jsonData) => {
        // 여기서 변수를 직접 할당하지 말고, 필요한 값을 직접 추출
        majorCredits = jsonData["졸업학점"]["전공학점"];
        totalCredits = jsonData["졸업학점"]["전체학점"];
  
        // 데이터 로딩 후 필요한 처리를 진행하거나 다른 함수 호출
        console.log("Loaded credits:", majorCredits, totalCredits);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });
  
  //전공,교양 학점 현재 score 확인
  function checkScoreTable(data) {
    const textDiv = document.createElement("h1");
    textDiv.textContent = "현재 취득 학점(전공, 전체)"; // 텍스트 설정
    textDiv.style.textAlign = "center"; // 가운데 정렬
  
    // 테이블 요소 생성
    const table = document.createElement("table");
    table.style.width = "80%"; // 가로폭 조정
    table.style.margin = "20px auto"; // 가운데 정렬을 위해 margin 조정
    table.style.border = "1px solid #ddd";
  
    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = ["전공 학점", "전체 학점"];
    headers.forEach((headerText) => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerCell.style.textAlign = "center";
      headerCell.style.backgroundColor = "#f5f5f5";
      headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성 (데이터를 채워 넣습니다.)
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
  
    // 데이터 배열
    // const rowData = [data.majorChidukHakjum+'/60', data.chidukHakjum+'/133']; // 데이터를 빈칸으로 채웁니다.
    const rowData = [
      `${data.majorChidukHakjum}/${majorCredits}`,
      `${data.chidukHakjum}/${totalCredits}`,
    ];
    const row = document.createElement("tr");
    tbody.appendChild(row);
    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      cell.style, (height = "50px"); //셀 높이
      cell.style.textAlign = "center";
      row.appendChild(cell);
    });
  
    document.body.insertBefore(textDiv, document.body.firstChild);
  
    // 문서의 body에 테이블 삽입
    document.body.insertBefore(table, textDiv.nextSibling);
  }
  
  // 취득 학점 불러오기
  fetch("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukTot.do", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((jsonData) => {
      // gyoyangTable 함수 호출하여 테이블 업데이트
      checkScoreTable(jsonData);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  
  //필수교양 테이블 재생성하여 배치
  function gyoyangTable(data) {
    //컨테이너 생성
    const container = document.createElement("div");
    container.style.marginLeft = "10%"; // 왼쪽 여백 설정
    container.style.width = "32%"; // 컨테이너의 너비를 40%로 설정
    container.style.float = "left"; // 왼쪽으로 정렬
    container.style.marginTop = "20px"; // 상단 여백 설정
  
    const textDiv = document.createElement("h1");
    textDiv.textContent = "필수교양"; // 텍스트 설정
    // textDiv.style.textAlign = 'left'; // 가운데 정렬
  
    // 테이블 요소 생성
    const table = document.createElement("table");
    table.style.width = "100%"; // 가로폭 조정
    // table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
    table.style.border = "1px solid #ddd";
  
    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = [
      "광운인 되기",
      "대학 영어",
      "정보 영역",
      "융합적 사고와 글쓰기 영역",
    ];
    headers.forEach((headerText) => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerCell.style.textAlign = "center";
      headerCell.style.height = "50px"; // 셀의 높이를 조절합니다.
      headerCell.style.backgroundColor = "#f5f5f5";
      headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성 (데이터를 채워 넣습니다.)
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
  
    // 데이터 배열
    const rowData = [data.aa8128, data.aa3362, data.aa76, data.aa64]; // 데이터를 빈칸으로 채웁니다.
    const row = document.createElement("tr");
    tbody.appendChild(row);
    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      cell.style, (height = "50px"); //셀 높이
      cell.style.textAlign = "center";
      row.appendChild(cell);
    });
  
    container.appendChild(textDiv);
    container.appendChild(table);
  
    var secondChild = document.body.childNodes[1]; // 두 번째 자식 요소 가져오기
    document.body.insertBefore(container, secondChild.nextSibling);
    // document.body.insertBefore(textDiv, secondChild.nextSibling);
  }
  
  //균형교양 테이블 생성 배치
  function partgyoyangTable(data) {
    //컨테이너 생성
    const container = document.createElement("div");
    container.style.marginRight = "10%"; // 왼쪽 여백 설정
    container.style.width = "45%"; // 컨테이너의 너비를 40%로 설정
    container.style.float = "right"; // 왼쪽으로 정렬
    container.style.marginTop = "20px"; // 상단 여백 설정
    container.style.marginBottom = "30px"; // 기필 table과 여백 설정
  
    const textDiv = document.createElement("h1");
    textDiv.textContent = "균형교양"; // 텍스트 설정
  
    // 테이블 요소 생성
    const table = document.createElement("table");
    table.style.width = "100%"; // 가로폭 조정
    // table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
    table.style.border = "1px solid #ddd";
  
    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = [
      "과학과 기술 영역",
      "인간과 철학 영역",
      "사회와 경제 영역",
      "글로벌 문화와 제2외국어 영역",
      "예술과 체육 영역",
      "수리와 자연 영역",
    ];
    headers.forEach((headerText) => {
      const headerCell = document.createElement("th");
      // 공백을 <br> 태그로 교체하여 줄바꿈을 수행
      headerCell.innerHTML = headerText.replace(/\s/g, "<br>");
      headerCell.style.textAlign = "center";
      headerCell.style.height = "50px"; // 셀의 높이를 조절합니다.
      headerCell.style.backgroundColor = "#f5f5f5";
      headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성 (데이터를 채워 넣습니다.)
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
  
    // 데이터 배열
    const rowData = [
      data.aa63,
      data.aa65,
      data.aa66,
      data.aa67,
      data.aa68,
      data.aa7881,
    ]; // 데이터를 빈칸으로 채웁니다.
    const row = document.createElement("tr");
    tbody.appendChild(row);
    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      cell.style, (height = "50px"); //셀 높이
      cell.style.textAlign = "center";
      row.appendChild(cell);
    });
    container.appendChild(textDiv);
    container.appendChild(table);
  
    // 균형교양 완료 여부 확인
    const completed = rowData.filter((value) => value >= 3).length >= 3;
    if (completed) {
      const completionDiv = document.createElement("div");
      completionDiv.textContent = "균형교양 수강 완료!";
      completionDiv.style.textAlign = "center";
      completionDiv.style.marginTop = "20px";
      completionDiv.style.fontSize = "15px";
      completionDiv.style.marginBottom = "20px";
      container.appendChild(completionDiv);
    }
  
    var secondChild = document.body.childNodes[1]; // 두 번째 자식 요소 가져오기
    document.body.insertBefore(container, secondChild.nextSibling);
  }
  
  function gyopilCompare(completedCourses, requiredCourses) {
    const container = document.getElementById("gyoyangTable"); // 결과를 삽입할 위치를 찾습니다.
  
    if (!container) {
      console.error("gyoyangTable element not found.");
      return;
    }
  
    // 결과를 담을 div 생성
    const resultsDiv = document.createElement("div");
    resultsDiv.id = "results"; // 결과 div에 ID 설정
    container.parentNode.insertBefore(resultsDiv, container.nextSibling); // gyoyangTable 다음에 결과 div 삽입
  
    // requiredCourses가 배열인지 확인
    if (!Array.isArray(requiredCourses) || requiredCourses.length === 0) {
      console.error("Error: requiredCourses must be a non-empty array");
      resultsDiv.textContent = "필요한 과목 데이터가 없습니다.";
      return;
    }
  
    // completedCourses ID를 문자열로 변환
    const completedIds = completedCourses.map((id) => id.toString());
  
    let needToTake = false; // 수강 필요한 과목이 있는지 표시
    resultsDiv.textContent = ""; // 결과 div 초기화
    requiredCourses.forEach((course) => {
      // 두 ID 모두 문자열로 비교
      if (!completedIds.includes(course.id)) {
        needToTake = true; // 수강 필요한 과목이 하나라도 있으면 true로 설정
        const p = document.createElement("p");
        p.textContent = `${course.name} 수강해야 됩니다.`;
        resultsDiv.appendChild(p);
      }
    });
  
    if (!needToTake) {
      // 모든 과목을 수강했다면
      resultsDiv.textContent = "모두 수강 완료!";
    }
  }
  
  //필수강의 테이블 생성!
  // 필수 강의 데이터와 비교하여 테이블 생성 및 페이지에 삽입하는 함수
  function createAndInsertTable(
    completedCourses,
    requiredCourses,
    hakbun,
    courseType
  ) {
    // 테이블 요소 생성
    const table = document.createElement("table");
    table.style.width = "80%"; // 가로폭 조정
    table.style.margin = "20px auto"; // 가운데 정렬을 위해 margin 조정
    table.style.border = "1px solid #ddd";
  
    // 캡션 추가
    const caption = document.createElement("caption");
    caption.style.textAlign = "left";
    caption.style.fontSize = "2em"; // h1 크기와 유사하게 설정
    caption.style.fontWeight = "bold"; // h1과 유사한 두껍게 설정
    caption.style.marginBottom = "10px"; // 여백 추가
    caption.textContent = courseType;
    table.appendChild(caption);
  
    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = ["학정번호", "과목명", "분류", "수강여부"];
    headers.forEach((headerText) => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerCell.style.textAlign = "center";
      headerCell.style.backgroundColor = "#f5f5f5";
      headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
  
    // 필수 강의 데이터와 비교하여 테이블 행 생성
    for (const category in requiredCourses.학번별[hakbun]) {
      requiredCourses.학번별[hakbun][category].forEach((course) => {
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const nameCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const statusCell = document.createElement("td");
  
        idCell.textContent = course.id;
        nameCell.textContent = course.name;
        categoryCell.textContent = category;
  
        // 수강 여부 확인
        const courseStatus = completedCourses.includes(parseInt(course.id))
          ? "수강 완료"
          : "수강 필요";
        statusCell.textContent = courseStatus;
  
        // 수강 필요 시 텍스트 스타일 변경
        if (courseStatus === "수강 필요") {
          statusCell.style.color = "red";
          statusCell.style.fontWeight = "bold";
        }
        if (courseStatus === "수강 완료") {
          statusCell.style.color = "blue";
          statusCell.style.fontWeight = "bold";
        }
  
        // 테이블 셀 스타일 설정
        [idCell, nameCell, categoryCell, statusCell].forEach((cell) => {
          cell.style.textAlign = "center";
          cell.style.border = "1px solid #ddd";
          row.appendChild(cell);
        });
  
        tbody.appendChild(row);
      });
    }
  
    document.body.appendChild(table);
  }
  
  //학정번호 추출하는 함수
  function extractCompletedCourses(data) {
    const hakjungNoList = [];
    data.forEach((item) => {
      item.sungjukList.forEach((sungjukItem) => {
        const parts = sungjukItem.hakjungNo.split("-");
        const thirdPart = parseInt(parts[2], 10);
        hakjungNoList.push(thirdPart);
      });
    });
    console.log(hakjungNoList);
    return hakjungNoList;
  }
  
  // 기초교양& 설계 학점 계산
  function calculateCompletedCredits(completedCourses, requiredCourses) {
    // 기초교양 학점
    let completedCredits = 0;
    // 설계 학점
    let completedDesignCredits = 0;
  
    // 기초교양 학점 계산
    requiredCourses.학번별[globalHakbun]["기초교양"].forEach((course) => {
      if (completedCourses.includes(parseInt(course.id))) {
        completedCredits += 3;
      }
    });
    // 설계 학점 계산
    requiredCourses.학번별[globalHakbun]["설계"].forEach((course) => {
      if (completedCourses.includes(parseInt(course.id))) {
        completedDesignCredits += course.designCredits;
      }
    });
  
    console.log(completedCredits);
    console.log(completedDesignCredits);
  
    // 기초교양 결과를 HTML에 추가
    const gichoContainer = document.createElement("div");
    gichoContainer.style.marginLeft = "10%"; // 왼쪽 여백 설정
  
    gichoContainer.style.float = "left"; // 왼쪽으로 정렬
  
    const h1_gicho = document.createElement("h1");
    h1_gicho.textContent = "기초교양(30)"; // 텍스트 설정
  
    const resultText_gicho = document.createElement("p");
    resultText_gicho.textContent = `수강한 기초교양 학점: ${completedCredits}/30`;
  
    gichoContainer.appendChild(h1_gicho);
    gichoContainer.appendChild(resultText_gicho);
    document.body.appendChild(gichoContainer);
  
    // 설계 학점 결과를 HTML에 추가
    const designContainer = document.createElement("div");
    designContainer.style.marginLeft = "5%"; // 왼쪽 여백 설정
  
    designContainer.style.float = "left"; // 왼쪽으로 정렬
  
    const h1_design = document.createElement("h1");
    h1_design.textContent = "설계학점(12)"; // 텍스트 설정
  
    const resultText_design = document.createElement("p");
    resultText_design.textContent = `수강한 설계 학점: ${completedDesignCredits}/12`;
  
    designContainer.appendChild(h1_design);
    designContainer.appendChild(resultText_design);
    document.body.appendChild(designContainer);
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    globalHakbun = getHakbunFromURL();
  
    // JSON 파일에서 데이터 불러오기
    fetch("../data/electronic.json")
      .then((response) => response.json())
      .then((jsonData) => {
        // 기필과 전필 데이터 추출
        const gipilData = {
          학번별: {
            [globalHakbun]: {
              기필: jsonData["학번별"][globalHakbun]["기초교양"]["기필"],
            },
          },
        };
  
        const geanpilData = {
          학번별: {
            [globalHakbun]: {
              전필: jsonData["학번별"][globalHakbun]["전필"],
            },
          },
        };
  
        const requiredCourses = {
          학번별: {
            [globalHakbun]: {
              기초교양: [
                ...jsonData["학번별"][globalHakbun]["기초교양"]["기필"],
                ...jsonData["학번별"][globalHakbun]["기초교양"]["기선"],
                ...jsonData["학번별"][globalHakbun]["기초교양"]["전산학(정보)"],
              ],
              설계: jsonData["학번별"][globalHakbun]["설계"],
            },
          },
        };
  
        // 필수교양 테이블 생성 함수 호출
        fetch("https://klas.kw.ac.kr/std/cps/inqire/GyoyangIsuInfo.do", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((jsonData) => {
            // gyoyangTable 함수 호출하여 테이블 업데이트
            partgyoyangTable(jsonData);
            gyoyangTable(jsonData);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
  
        // 수강한 강의들 불러오기
        fetch("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreSungjukInfo.do", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((jsonData) => {
            console.log(jsonData);
            // gyoyangTable 함수 호출하여 테이블 업데이트
            const completedCourses = extractCompletedCourses(jsonData);
            console.log(completedCourses);
            // 기필과 전필에 대한 테이블 생성 및 삽입
            createAndInsertTable(
              completedCourses,
              gipilData,
              globalHakbun,
              "기초필수"
            );
            createAndInsertTable(
              completedCourses,
              geanpilData,
              globalHakbun,
              "전공필수"
            );
            console.log(requiredCourses);
            calculateCompletedCredits(completedCourses, requiredCourses);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  });