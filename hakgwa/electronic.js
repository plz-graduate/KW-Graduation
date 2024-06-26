document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["key"], function (result) {});
});

let globalHakbun;
let gipilData = {};
let geanpilData = {};
let gyopilData = {};

//교필 데이터 변환해주는 함수
function transformCourseData(courseData) {
  let transformedData = [];
  courseData.forEach((course) => {
    if (Array.isArray(course.name)) {
      course.name.forEach((name, index) => {
        transformedData.push({
          id: course.id[index],
          name: name,
        });
      });
    } else {
      transformedData.push({
        id: course.id,
        name: course.name,
      });
    }
  });
  return transformedData;
}

//학번 추출해서 전역변수로 만드는 함수
function getHakbunFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get("hakbun");
}

let majorCredits, totalCredits, gichoCredit, designCredit;
document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/electronic.json")
    .then((response) => response.json())
    .then((jsonData) => {
      // 여기서 변수를 직접 할당하지 말고, 필요한 값을 직접 추출
      majorCredits = jsonData["졸업학점"]["전공학점"];
      totalCredits = jsonData["졸업학점"]["전체학점"];
      gichoCredit = jsonData["졸업학점"]["기초교양"];
      designCredit = jsonData["졸업학점"]["설계학점"];
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

//전공,교양 학점 현재 score 확인
function checkScoreTable(data) {
  const navbar = document.querySelector(".navbar"); // 상단바 요소 선택

  const textDiv = document.createElement("h1");
  textDiv.textContent = "현재 취득 학점(전공, 전체)"; // 텍스트 설정

  textDiv.style.textAlign = "center"; // 가운데 정렬
  textDiv.style.marginTop = `${navbar.offsetHeight}px`; // 상단바의 높이만큼 여백 설정

  // 테이블 요소 생성
  const table = document.createElement("table");
  table.style.width = "60%"; // 가로폭 조정
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
    headerCell.style.fontSize = "1.3em"; // 헤더 셀의 폰트 크기 설정
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
    cell.style, (height = "60px"); //셀 높이
    cell.style.textAlign = "center";
    cell.style.fontSize = "1.1em";
    row.appendChild(cell);
  });

  // 행의 높이 지정
  const rows = table.querySelectorAll("tr");
  rows.forEach((row) => {
    row.style.height = "40px"; // 원하는 높이 값으로 변경 가능
  });

  // document.body.insertBefore(textDiv, document.body.firstChild);

  // wrapper 아래에 추가
  const wrapper = document.querySelector(".wrapper");
  wrapper.appendChild(textDiv);
  wrapper.appendChild(table);
  // document.body.insertBefore(table, navbar.nextSibling);
  // document.body.insertBefore(textDiv, navbar.nextSibling);

  // 수강 학점 채우기 조건 확인
  let result;
  if (
    data.majorChidukHakjum >= majorCredits &&
    data.chidukHakjum >= totalCredits
  ) {
    result = "전공 학점, 전체 학점 채우기 완료!";
  } else if (
    data.majorChidukHakjum < majorCredits &&
    data.chidukHakjum >= totalCredits
  ) {
    result = "전공 학점 채우기 실패! 전공 학점을 더 수강하세요";
  } else if (
    data.majorChidukHakjum >= majorCredits &&
    data.chidukHakjum < totalCredits
  ) {
    result = "전공 학점 채우기 성공했지만 전체 학점이 부족합니다.";
  } else {
    result = "전공 학점, 전체 학점 모두 부족합니다.";
  }
  createBottomTable("현재취득 학점", result);
}

//필수교양 테이블 재생성하여 배치
function gyoyangTable(data) {
  //컨테이너 생성
  const container = document.createElement("div");
  container.style.marginLeft = "20%"; // 왼쪽 여백 설정
  container.style.width = "30%"; // 컨테이너의 너비를 40%로 설정
  container.style.float = "left"; // 왼쪽으로 정렬
  container.style.marginTop = "20px"; // 상단 여백 설정

  const textDiv = document.createElement("h1");
  textDiv.textContent = "필수교양"; // 텍스트 설정
  // textDiv.style.textAlign = 'left'; // 가운데 정렬

  // 테이블 요소 생성
  const table = document.createElement("table");
  table.id = "gyoyangTable"; // 테이블에 ID 할당
  table.style.width = "80%"; // 가로폭 조정
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
    headerCell.style.fontSize = "1.1em";
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
    cell.style.fontSize = "1em";
    row.appendChild(cell);
  });

  container.appendChild(textDiv);
  container.appendChild(table);

  var secondChild = document.body.childNodes[2]; // 두 번째 자식 요소 가져오기
  document.body.insertBefore(container, secondChild.nextSibling);
  // document.body.insertBefore(textDiv, secondChild.nextSibling);

  // 결과 출력을 위한 div 생성 및 추가
  const resultsDiv = document.createElement("div");
  resultsDiv.id = "gyopilResults"; // gyopilCompare 함수에서 사용할 ID
  container.appendChild(resultsDiv);
}

//균형교양 테이블 생성 배치
function partgyoyangTable(data) {
  //컨테이너 생성
  const container = document.createElement("div");
  container.style.marginRight = "19%"; // 왼쪽 여백 설정
  container.style.width = "30%"; // 컨테이너의 너비를 40%로 설정
  container.style.float = "right"; // 왼쪽으로 정렬
  container.style.marginTop = "20px"; // 상단 여백 설정
  container.style.marginBottom = "30px"; // 기필 table과 여백 설정

  const textDiv = document.createElement("h1");
  textDiv.textContent = "균형교양"; // 텍스트 설정

  // 테이블 요소 생성
  const table = document.createElement("table");
  table.style.width = "95%"; // 가로폭 조정
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
    cell.style.fontSize = "1em";
    row.appendChild(cell);
  });
  container.appendChild(textDiv);
  container.appendChild(table);

  // 균형교양 완료 여부 확인
  const completed = rowData.filter((value) => value >= 3).length >= 3;
  const completionMessage = completed
    ? "균형 교양 수강 완료!"
    : "균형 교양 실패!";
  const completionDiv = document.createElement("div");
  completionDiv.textContent = completionMessage;
  completionDiv.style.textAlign = "center";
  completionDiv.style.marginTop = "20px";
  completionDiv.style.fontSize = "15px";
  completionDiv.style.marginBottom = "20px";
  container.appendChild(completionDiv);

  // 결과를 createBottomTable 함수로 전달
  createBottomTable("균형 교양", completionMessage);

  var secondChild = document.body.childNodes[2]; // 두 번째 자식 요소 가져오기
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
  resultsDiv.style.fontSize = "15px"; // 결과 div의 글자 크기를 15px로 설정
  resultsDiv.style.textAlign = "center";
  resultsDiv.style.marginTop = "20px";
  resultsDiv.style.marginBottom = "20px";
  resultsDiv.style.color = "red";
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

  const results = []; // 결과를 담을 배열 초기화

  requiredCourses.forEach((course) => {
    // 두 ID 모두 문자열로 비교
    if (!completedIds.includes(course.id)) {
      needToTake = true; // 수강 필요한 과목이 하나라도 있으면 true로 설정
      results.push(`${course.name} 수강해야 됩니다.`);
    }
  });

  if (!needToTake) {
    // 모든 과목을 수강했다면
    results.push("모두 수강 완료!");
  }

  // 결과를 createBottomTable 함수로 전달
  results.forEach((result) => {
    createBottomTable("필수 교양", result);
  });
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
  table.style.width = "60%"; // 가로폭 조정
  table.style.margin = "30px auto"; // 가운데 정렬을 위해 margin 조정
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
        createBottomTable("필수 과목 수강 필요!", course.name);
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

    // 행의 높이 지정
    const rows = table.querySelectorAll("tr");
    rows.forEach((row) => {
      row.style.height = "40px"; // 원하는 높이 값으로 변경 가능
    });
  }

  // 모든 강의가 수강 완료되었는지 확인
  const allCompleted = !Array.from(document.querySelectorAll("td")).some((td) =>
    td.textContent.includes("수강 필요")
  );

  // 모든 과목이 수강 완료되었으면 결과를 전달
  if (allCompleted) {
    if (name == "전필") {
      createBottomTable("전공 필수", "전공 필수 과목 수강 완료!");
    } else {
      createBottomTable("기초 필수", "기초 필수 과목 수강 완료!");
    }
  }

  // .tablegw 클래스를 가진 첫 번째 요소를 찾아 그 다음 위치에 테이블 삽입
  const insertionPoint = document.querySelector(".tablegw");
  if (insertionPoint) {
    insertionPoint.parentNode.insertBefore(table, insertionPoint.nextSibling);
  } else {
    document.body.appendChild(table);
  }
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

  return hakjungNoList;
}

// 이전에 작성한 createBottomTable 함수를 그대로 사용하여 HTML 테이블에 데이터를 삽입합니다.
function createBottomTable(category, data) {
  const table = document.querySelector(".tablegw_new");

  if (table) {
    const tbody = table.querySelector("tbody");
    const newRow = document.createElement("tr");

    // 첫 번째 칸에 카테고리를, 두 번째 칸에 데이터를 삽입합니다.
    const categoryCell = document.createElement("td");
    categoryCell.textContent = category; // 카테고리
    const valueCell = document.createElement("td");
    valueCell.textContent = data; // 데이터
    newRow.appendChild(categoryCell); // 첫 번째 칸에 카테고리 삽입
    newRow.appendChild(valueCell); // 두 번째 칸에 데이터 삽입

    tbody.appendChild(newRow);
  } else {
    console.error("Table not found.");
  }
}

// 기초교양& 설계 학점 계산
function calculateCompletedCredits(completedCourses, requiredCourses) {
  let completedCredits = 0;
  let completedDesignCredits = 0;

  // 기초교양 과목 수강학점 계산
  const gichoCourse = requiredCourses.학번별[globalHakbun]["기초교양"];
  gichoCourse.forEach((course) => {
    if (completedCourses.includes(parseInt(course.id))) {
      completedCredits += 3;
    }
  });

  // 설계 학점 수강학점 계산
  const designCourse = requiredCourses.학번별[globalHakbun]["설계"];
  designCourse.forEach((course) => {
    if (completedCourses.includes(parseInt(course.id))) {
      completedDesignCredits += course.designCredits;
    }
  });

  const completionMessageG =
    completedCredits >= 30 ? "기초 교양 학점 만족!" : "기초 교양 학점 부족!";
  const completionMessageD =
    completedDesignCredits >= 30 ? "설계 학점 만족!" : "설계 학점 부족!";
  createBottomTable("기초 교양", completionMessageG);
  createBottomTable("설계 과목", completionMessageD);

  // 컨테이너 div 설정
  const container = document.createElement("div");
  container.className = "container";
  container.style.width = "60%"; // 가로폭 조정
  container.style.margin = "30px auto";
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.justifyContent = "space-around";
  document.body.appendChild(container);

  // 기초교양 테이블 생성 및 스타일 설정
  const gichoContainer = document.createElement("div");
  gichoContainer.className = "section";
  gichoContainer.style.width = "100%";
  gichoContainer.style.marginBottom = "40px";

  // 기초교양 제목 및 토글 버튼
  const headerGicho = document.createElement("div");
  headerGicho.className = "toggle-button";
  headerGicho.innerHTML = `기초교양(${gichoCredit})<span class="arrow">&#9660;</span>`;
  headerGicho.style.fontSize = "24px";
  headerGicho.style.fontWeight = "700";
  headerGicho.onclick = () => {
    const table = gichoContainer.querySelector("table");
    const arrow = headerGicho.querySelector(".arrow");
    const isHidden = table.style.display === "none";
    table.style.display = table.style.display === "none" ? "table" : "none";
    arrow.classList.toggle("up", !isHidden);
  };
  gichoContainer.appendChild(headerGicho);

  // 기초교양 수강한 학점 표시
  const resultText_gicho = document.createElement("p");
  resultText_gicho.textContent = `수강한 기초교양 학점: ${completedCredits}/${gichoCredit}`;
  resultText_gicho.style.fontSize = "15px";
  resultText_gicho.style.fontWeight = "700";
  gichoContainer.appendChild(resultText_gicho);

  // 기초교양 테이블 설정
  const table_gicho = document.createElement("table");
  table_gicho.style.width = "100%";
  table_gicho.style.border = "1px solid #ddd";
  gichoContainer.appendChild(table_gicho);

  // 테이블 헤더 설정
  const thead_gicho = document.createElement("thead");
  table_gicho.appendChild(thead_gicho);
  const headerRow_gicho = document.createElement("tr");
  thead_gicho.appendChild(headerRow_gicho);
  const headers_gicho = ["학정번호", "과목명", "학정번호", "과목명"];
  headers_gicho.forEach((headerText) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = headerText;
    headerCell.style.textAlign = "center";
    headerCell.style.backgroundColor = "#f5f5f5";
    headerRow_gicho.appendChild(headerCell);
  });

  // 기초교양 과목 데이터 처리
  const tbody_gicho = document.createElement("tbody");
  table_gicho.appendChild(tbody_gicho);
  const gichoCoursesList = requiredCourses.학번별[globalHakbun]["기초교양"];
  for (let i = 0; i < gichoCoursesList.length; i += 2) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 2; j++) {
      if (i + j < gichoCoursesList.length) {
        const course = gichoCoursesList[i + j];
        const tdId = document.createElement("td");
        tdId.textContent = course.id;
        const tdName = document.createElement("td");
        tdName.textContent = course.name;
        if (completedCourses.includes(parseInt(course.id))) {
          tdName.style.color = "blue";
        }
        [tdId, tdName].forEach((cell) => {
          cell.style.textAlign = "center";
          cell.style.height = "30px";
          cell.style.border = "1px solid #ddd";
          tr.appendChild(cell);
        });
      }
    }
    tbody_gicho.appendChild(tr);
  }

  container.appendChild(gichoContainer);

  // 설계 과목 테이블 생성 및 스타일 설정
  const designContainer = document.createElement("div");
  designContainer.className = "section";
  designContainer.style.width = "100%";

  // 설계 제목 및 토글 버튼
  const headerDesign = document.createElement("div");
  headerDesign.className = "toggle-button";
  headerDesign.innerHTML = `설계과목(${designCredit})<span class="arrow">&#9660;</span>`;
  headerDesign.style.fontSize = "24px";
  headerDesign.style.fontWeight = "700";
  headerDesign.onclick = () => {
    const table = designContainer.querySelector("table");
    const arrow = designContainer.querySelector(".arrow");
    const isHidden = table.style.display === "none";
    table.style.display = table.style.display === "none" ? "table" : "none";
    arrow.classList.toggle("up", !isHidden);
  };
  designContainer.appendChild(headerDesign);

  // 설계 수강한 학점 표시
  const resultText_design = document.createElement("p");
  resultText_design.textContent = `수강한 설계 학점: ${completedDesignCredits}/${designCredit}`;
  resultText_design.style.fontSize = "15px";
  resultText_design.style.fontWeight = "700";
  designContainer.appendChild(resultText_design);

  // 설계 테이블 설정
  const table_design = document.createElement("table");
  table_design.style.width = "100%";
  table_design.style.border = "1px solid #ddd";
  designContainer.appendChild(table_design);

  // 테이블 헤더 설정
  const thead_design = document.createElement("thead");
  table_design.appendChild(thead_design);
  const headerRow_design = document.createElement("tr");
  thead_design.appendChild(headerRow_design);
  const headers_design = [
    "학정번호",
    "과목명",
    "이수학점",
    "학정번호",
    "과목명",
    "이수학점",
  ];
  headers_design.forEach((headerText) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = headerText;
    headerCell.style.textAlign = "center";
    headerCell.style.backgroundColor = "#f5f5f5";
    headerRow_design.appendChild(headerCell);
  });

  // 설계 과목 데이터 처리
  const tbody_design = document.createElement("tbody");
  table_design.appendChild(tbody_design);
  const designCoursesList = requiredCourses.학번별[globalHakbun]["설계"];
  for (let i = 0; i < designCoursesList.length; i += 2) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 2; j++) {
      if (i + j < designCoursesList.length) {
        const course = designCoursesList[i + j];
        const tdId = document.createElement("td");
        tdId.textContent = course.id;
        const tdName = document.createElement("td");
        tdName.textContent = course.name;
        const tdCredits = document.createElement("td");
        tdCredits.textContent = `${course.designCredits} 학점`;
        if (completedCourses.includes(parseInt(course.id))) {
          tdName.style.color = "blue";
        }
        [tdId, tdName, tdCredits].forEach((cell) => {
          cell.style.textAlign = "center";
          cell.style.height = "30px";
          cell.style.border = "1px solid #ddd";
          tr.appendChild(cell);
        });
      }
    }
    tbody_design.appendChild(tr);
  }
  container.appendChild(designContainer);
}

document.addEventListener("DOMContentLoaded", function () {
  try {
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

        const gyopilData = transformCourseData(
          jsonData["학번별"][globalHakbun]["교필"]
        );

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

        //필수교양, 균형교양 불러오기
        window.scrollTo(0, 0);
        chrome.storage.local.get(["GyoyangIsuInfo"], function (result) {
          partgyoyangTable(result.GyoyangIsuInfo);
          gyoyangTable(result.GyoyangIsuInfo);
        });

        //수강한 강의 불러오기
        chrome.storage.local.get(["AtnlcScreSungjukInfo"], function (result) {
          const completedCourses = extractCompletedCourses(
            result.AtnlcScreSungjukInfo
          );
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
          // 기초교양 및 설계학점 불러오기
          calculateCompletedCredits(completedCourses, requiredCourses);
          gyopilCompare(completedCourses, gyopilData);
        });

        //취득학점 불러오기
        chrome.storage.local.get(["AtnlcScreSungjukTot"], function (result) {
          checkScoreTable(
            result.AtnlcScreSungjukTot,
            majorCredits,
            totalCredits
          );
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } catch (error) {
    console.error("dom부터 실패", error);
  }
});
