
let majorCredits, totalCredits;
document.addEventListener("DOMContentLoaded", function() {
  fetch('../data/informationConvergence.json')
      .then(response => response.json())
      .then(jsonData => {
          // 여기서 변수를 직접 할당하지 말고, 필요한 값을 직접 추출
          majorCredits = jsonData["졸업학점"]["전공학점"];
          totalCredits = jsonData["졸업학점"]["전체학점"];

           // 데이터 로딩 후 필요한 처리를 진행하거나 다른 함수 호출
           console.log("Loaded credits:", majorCredits, totalCredits);
      })
      .catch(error => {
          console.error('Error fetching data:', error);
      });
});
// 데이터 순차적으로 로드
document.addEventListener("DOMContentLoaded", async function() {
  console.log("Script started");  // 스크립트 실행 확인
  try {
    globalHakbun = getHakbunFromURL();
    let gipilData = {};
    let geanpilData = {};
    let gyopilData ={}

    const response = await fetch('../data/informationConvergence.json');
    const jsonData = await response.json();

    if (jsonData["학번별"] && jsonData["학번별"][globalHakbun]) {
      if (jsonData["학번별"][globalHakbun]["기필"]) {
        gipilData = {
          "학번별": {
            [globalHakbun]: {
              "기필": jsonData["학번별"][globalHakbun]["기필"]
            }
          }
        };
      }
      if (jsonData["학번별"][globalHakbun]["전필"]) {
        geanpilData = {
          "학번별": {
            [globalHakbun]: {
              "전필": jsonData["학번별"][globalHakbun]["전필"]
            }
          }
        };
      }
      if (jsonData["학번별"][globalHakbun]["교필"]) {
        gyopilData = transformCourseData(jsonData["학번별"][globalHakbun]["교필"]);
    }
    } else {
      console.error("학번별 데이터 또는 학번 정보가 없습니다.");
    }

    //기초교양, 균형교양 불러오기
    window.scrollTo(0, 0); 
    chrome.storage.local.get(['GyoyangIsuInfo'], function (result) {
      gyoyangTable(result.GyoyangIsuInfo);
      partgyoyangTable(result.GyoyangIsuInfo);
    });
    //수강한 강의 불러오기
    chrome.storage.local.get(['AtnlcScreSungjukInfo'], function (result) {
      const completedCourses=extractCompletedCourses(result.AtnlcScreSungjukInfo);
      createAndInsertTable(completedCourses, gipilData,"기필");
      createAndInsertTable(completedCourses, geanpilData,"전필");
      gyopilCompare(completedCourses,gyopilData);
    });


    //취득학점 불러오기
    chrome.storage.local.get(['AtnlcScreSungjukTot'], function (result) {
      checkScoreTable(result.AtnlcScreSungjukTot,majorCredits,totalCredits);
    });
  } catch (error) {
        console.error('Error fetching data:', error);
      }
});

//교필 데이터 변환해주는 함수
function transformCourseData(courseData) {
  let transformedData = [];
  courseData.forEach(course => {
      if (Array.isArray(course.name)) {
          course.name.forEach((name, index) => {
              transformedData.push({
                  id: course.id[index],
                  name: name
              });
          });
      } else {
          transformedData.push({
              id: course.id,
              name: course.name
          });
      }
  });
  return transformedData;
}



//학번 추출해서 전역변수로 만드는 함수
function getHakbunFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('hakbun');
}







//전공,교양 학점 현재 score 확인
function checkScoreTable(data) {
  const navbar = document.querySelector('.navbar'); // 상단바 요소 선택

    const textDiv = document.createElement('h1');
    textDiv.textContent = '현재 취득 학점(전공, 전체)'; // 텍스트 설정

    textDiv.style.textAlign = 'center'; // 가운데 정렬
    textDiv.style.marginTop = `${navbar.offsetHeight}px`; // 상단바의 높이만큼 여백 설정
    
    // 테이블 요소 생성
    const table = document.createElement('table');
    table.style.width = '60%'; // 가로폭 조정
    table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
    table.style.border = '1px solid #ddd';
  
    // 테이블 헤더 생성
    const thead = document.createElement('thead');
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = ['전공 학점', '전체 학점'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.textAlign = 'center';
        headerCell.style.backgroundColor = '#f5f5f5';
        headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성 (데이터를 채워 넣습니다.)
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
  
  
      // 데이터 배열
      // const rowData = [data.majorChidukHakjum+'/60', data.chidukHakjum+'/133']; // 데이터를 빈칸으로 채웁니다.
      const rowData = [
        `${data.majorChidukHakjum}/${majorCredits}`, 
        `${data.chidukHakjum}/${totalCredits}`
    ];
      const row = document.createElement('tr');
      tbody.appendChild(row);
      rowData.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        cell.style,height ='50px'; //셀 높이
        cell.style.textAlign = 'center';
        row.appendChild(cell);
      });

    // document.body.insertBefore(textDiv, document.body.firstChild);

      // wrapper 아래에 추가
      const wrapper = document.querySelector('.wrapper');
      wrapper.appendChild(textDiv);
      wrapper.appendChild(table);
    // document.body.insertBefore(table, navbar.nextSibling);
    // document.body.insertBefore(textDiv, navbar.nextSibling);


    // 수강 학점 채우기 조건 확인
    let result;
    if (data.majorChidukHakjum >= majorCredits && data.chidukHakjum >= totalCredits) {
        result = "전공 학점, 전체 학점 채우기 완료!";
    } else if (data.majorChidukHakjum < majorCredits && data.chidukHakjum >= totalCredits) {
        result = "전공 학점 채우기 실패! 전공 학점을 더 수강하세요";
    } else if(data.majorChidukHakjum >= majorCredits && data.chidukHakjum < totalCredits) {
      result = "전공 학점 채우기 성공했지만 전체 학점이 부족합니다.";
    }else{
      result = "전공 학점, 전체 학점 모두 부족합니다."
    }
    createBottomTable("현재취득 학점",result);
    }
  
    
    //기초교양 테이블 재생성하여 배치
    function gyoyangTable(data) {
      
      //컨테이너 생성
      const container = document.createElement('div');
      container.style.marginLeft = '20%'; // 왼쪽 여백 설정
      container.style.width = '30%'; // 컨테이너의 너비를 40%로 설정
      container.style.float = 'left'; // 왼쪽으로 정렬
      container.style.marginTop = '20px'; // 상단 여백 설정
    
      const textDiv = document.createElement('h1');
      textDiv.textContent = '기초교양'; // 텍스트 설정
      // textDiv.style.textAlign = 'left'; // 가운데 정렬
    
      // 테이블 요소 생성
      const table = document.createElement('table');
      table.id = 'gyoyangTable'; // 테이블에 ID 할당
      table.style.width = '80%'; // 가로폭 조정
      // table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
      table.style.border = '1px solid #ddd';
    
      // 테이블 헤더 생성
      const thead = document.createElement('thead');
      table.appendChild(thead);
    
      // 헤더 행 생성
      const headerRow = document.createElement('tr');
      thead.appendChild(headerRow);
    
      // 헤더 셀 생성
      const headers = ['광운인 되기', '대학 영어','정보 영역','융합적 사고와 글쓰기 영역'];
      headers.forEach(headerText => {
          const headerCell = document.createElement('th');
          headerCell.textContent = headerText;
          headerCell.style.textAlign = 'center';
          headerCell.style.height = '50px'; // 셀의 높이를 조절합니다.
          headerCell.style.backgroundColor = '#f5f5f5';
          headerRow.appendChild(headerCell);
      });
    
      // 테이블 본문 생성 (데이터를 채워 넣습니다.)
      const tbody = document.createElement('tbody');
      table.appendChild(tbody);
    
    
      // 데이터 배열
      const rowData = [data.aa8128, data.aa3362, data.aa76, data.aa64]; 
      const row = document.createElement('tr');
      tbody.appendChild(row);
      rowData.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        cell.style,height ='50px'; //셀 높이
        cell.style.textAlign = 'center';
        row.appendChild(cell);
      });
    
      container.appendChild(textDiv);
      container.appendChild(table);
    
    
    
      var secondChild = document.body.childNodes[2]; // 두 번째 자식 요소 가져오기
      document.body.insertBefore(container, secondChild.nextSibling);
      // document.body.insertBefore(textDiv, secondChild.nextSibling);

      // 결과 출력을 위한 div 생성 및 추가
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'gyopilResults'; // gyopilCompare 함수에서 사용할 ID
      container.appendChild(resultsDiv);
      
    }



  
  

  
  
  //균형교양 테이블 생성 배치
  function partgyoyangTable(data) {
    //컨테이너 생성
    const container = document.createElement('div');
    container.style.marginRight = '19%'; // 오른쪽 여백 설정
    container.style.width = '30%'; // 컨테이너의 너비를 40%로 설정
    container.style.float = 'right'; // 오른쪽으로 정렬
    container.style.marginTop = '20px'; // 상단 여백 설정
  
    const textDiv = document.createElement('h1');
    textDiv.textContent = '균형교양'; // 텍스트 설정
  
    // 테이블 요소 생성
    const table = document.createElement('table');
    table.style.width = '95%'; // 가로폭 조정
    // table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
    table.style.border = '1px solid #ddd';
  
    // 테이블 헤더 생성
    const thead = document.createElement('thead');
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = ['과학과 기술 영역', '인간과 철학 영역', '사회와 경제 영역', '글로벌 문화와 제2외국어 영역', '예술과 체육 영역', '수리와 자연 영역'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        // 공백을 <br> 태그로 교체하여 줄바꿈을 수행
        headerCell.innerHTML = headerText.replace(/\s/g, '<br>');
        headerCell.style.textAlign = 'center';
        headerCell.style.height = '50px'; // 셀의 높이를 조절합니다.
        headerCell.style.backgroundColor = '#f5f5f5';
        headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성 (데이터를 채워 넣습니다.)
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
  
  
    // 데이터 배열
    const rowData = [data.aa63, data.aa65, data.aa66, data.aa67,data.aa68,data.aa7881]; // 데이터를 빈칸으로 채웁니다.
    const row = document.createElement('tr');
    tbody.appendChild(row);
    rowData.forEach(cellData => {
      const cell = document.createElement('td');
      cell.textContent = cellData;
      cell.style,height ='50px'; //셀 높이
      cell.style.textAlign = 'center';
      row.appendChild(cell);
    });

    container.appendChild(textDiv);
    container.appendChild(table);


    // 균형교양 완료 여부 확인
    const completed = rowData.filter(value => value >= 3).length >= 3;
    const completionMessage = completed ? '균형교양 수강 완료!' : '균형교양 실패!';
    const completionDiv = document.createElement('div');
    completionDiv.textContent = completionMessage;
    completionDiv.style.textAlign = 'center';
    completionDiv.style.marginTop = '20px';
    completionDiv.style.fontSize = '15px';
    completionDiv.style.marginBottom = '20px';
    container.appendChild(completionDiv);

    // 결과를 createBottomTable 함수로 전달
    createBottomTable("균형 교양",completionMessage);

    
  
  
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
      resultsDiv.style.textAlign = 'center';
      resultsDiv.style.marginTop = '20px';
      resultsDiv.style.marginBottom = '20px'; 
      resultsDiv.style.color='red';
      container.parentNode.insertBefore(resultsDiv, container.nextSibling); // gyoyangTable 다음에 결과 div 삽입
      
      // requiredCourses가 배열인지 확인
      if (!Array.isArray(requiredCourses) || requiredCourses.length === 0) {
          console.error("Error: requiredCourses must be a non-empty array");
          resultsDiv.textContent = "필요한 과목 데이터가 없습니다.";
          return;
      }
  
      // completedCourses ID를 문자열로 변환
      const completedIds = completedCourses.map(id => id.toString());
  
      let needToTake = false; // 수강 필요한 과목이 있는지 표시
      resultsDiv.textContent = "";  // 결과 div 초기화
      requiredCourses.forEach(course => {
          // 두 ID 모두 문자열로 비교
          if (!completedIds.includes(course.id)) {
              needToTake = true; // 수강 필요한 과목이 하나라도 있으면 true로 설정
              const p = document.createElement("p");
              p.textContent = `${course.name} 수강해야 됩니다.`;
              resultsDiv.appendChild(p);
          }
      });
  
      if (!needToTake) { // 모든 과목을 수강했다면
          resultsDiv.textContent = "모두 수강 완료!";
      }

      const results = []; // 결과를 담을 배열 초기화

      requiredCourses.forEach(course => {
          // 두 ID 모두 문자열로 비교
          if (!completedIds.includes(course.id)) {
              needToTake = true; // 수강 필요한 과목이 하나라도 있으면 true로 설정
              results.push(`${course.name} 수강해야 됩니다.`);
          }
      });
  
      if (!needToTake) { // 모든 과목을 수강했다면
          results.push("모두 수강 완료!");
      }
  
      // 결과를 createBottomTable 함수로 전달
      results.forEach(result => {
          createBottomTable("기초 교양",result);
      });
  
    }
  

  // 전역변수로 선언된 gipilData와 geanpilData
let gipilData = {};
let geanpilData = {};

  // 필수 강의 데이터와 비교하여 테이블 생성 및 페이지에 삽입하는 함수
  function createAndInsertTable(completedCourses, requiredCourses,name) {
    try{
      console.log("requiredCourses : ",requiredCourses);
      // 테이블 요소 생성
    const table = document.createElement('table');
    table.style.width = '60%'; // 가로폭 조정
    table.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
    table.style.border = '1px solid #ddd';
  
    // 테이블 헤더 생성
    const thead = document.createElement('thead');
    table.appendChild(thead);
  
    // 헤더 행 생성
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
  
    // 헤더 셀 생성
    const headers = ['학정번호', '과목명', '분류', '수강여부'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.textAlign = 'center';
        headerCell.style.backgroundColor = '#f5f5f5';
        headerRow.appendChild(headerCell);
    });
  
    // 테이블 본문 생성
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    console.log("Global Hakbun:", globalHakbun);


    console.log("Courses data:", requiredCourses.학번별[globalHakbun]);

  
    // 필수 강의 데이터와 비교하여 테이블 행 생성
    for (const category in requiredCourses.학번별[globalHakbun]) {
        requiredCourses.학번별[globalHakbun][category].forEach(course => {
          console.log("Processing course:", course);
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            const nameCell = document.createElement('td');
            const categoryCell = document.createElement('td');
            const statusCell = document.createElement('td');
  
            idCell.textContent = course.id;
            nameCell.textContent = course.name;
            categoryCell.textContent = category;
  
            // 수강 여부 확인
            const courseStatus = completedCourses.includes(parseInt(course.id)) ? "수강 완료" : "수강 필요";
            statusCell.textContent = courseStatus;
            console.log("Completed courses list:", completedCourses);

  
            // 수강 필요 시 텍스트 스타일 변경
            if (courseStatus === "수강 필요") {
                statusCell.style.color = 'red';
                statusCell.style.fontWeight = 'bold';
                createBottomTable("필수 과목 수강 필요!",course.name);
            }
  
            // 테이블 셀 스타일 설정
            [idCell, nameCell, categoryCell, statusCell].forEach(cell => {
                cell.style.textAlign = 'center';
                cell.style.border = '1px solid #ddd';
                row.appendChild(cell);
            });
  
            tbody.appendChild(row);
            console.log("Row added to table");
        });
    }

    // 모든 강의가 수강 완료되었는지 확인
    const allCompleted = !document.querySelector('td[style*="color: red"]');
  
    // 모든 과목이 수강 완료되었으면 결과를 전달
    if (allCompleted) {
      if(name=="전필"){
        createBottomTable("전공 필수","전공 필수 과목 수강 완료!");
      }else{
        createBottomTable("기초 필수","기초 필수 과목 수강 완료!");
      }
      

  }


    // .tablegw 클래스를 가진 첫 번째 요소를 찾아 그 다음 위치에 테이블 삽입
    const insertionPoint = document.querySelector('.tablegw');
    if (insertionPoint) {
        insertionPoint.parentNode.insertBefore(table, insertionPoint.nextSibling);
    } else {
        document.body.appendChild(table);
    }

    }catch(error){
      console.log.error('Error in createAndInsertTable:', error);
    }
    
  }

  
  //학정번호 추출하는 함수
    function extractCompletedCourses(data) {
      const hakjungNoList = [];
      data.forEach(item => {
          item.sungjukList.forEach(sungjukItem => {
            const parts = sungjukItem.hakjungNo.split('-');
            const thirdPart = parseInt(parts[2], 10);
            hakjungNoList.push(thirdPart);
          });
      });
      console.log(hakjungNoList);
      return hakjungNoList;
  }
  
  let requiredCoursesData = {};
  

  var globalHakbun;
  

  // 이전에 작성한 createBottomTable 함수를 그대로 사용하여 HTML 테이블에 데이터를 삽입합니다.
  function createBottomTable(category, data) {
    const table = document.querySelector('.tablegw_new');
  
    if (table) {
        const tbody = table.querySelector('tbody');
        const newRow = document.createElement('tr');
        
        // 첫 번째 칸에 카테고리를, 두 번째 칸에 데이터를 삽입합니다.
        const categoryCell = document.createElement('td');
        categoryCell.textContent = category; // 카테고리
        const valueCell = document.createElement('td');
        valueCell.textContent = data; // 데이터
        newRow.appendChild(categoryCell); // 첫 번째 칸에 카테고리 삽입
        newRow.appendChild(valueCell); // 두 번째 칸에 데이터 삽입
  
        tbody.appendChild(newRow);
    } else {
        console.error("Table not found.");
    }
  }

  // function createBottomTable(data) {

  //   const table = document.querySelector('.tablegw');

  //   if (table) {

  //     const row = document.createElement('tr');
  //     const cell = document.createElement('td');
  //     cell.textContent = data;
  //     cell.style.height = '30px'; // 셀 높이
  //     cell.style.textAlign = 'center';
  //     cell.style.border = '1px solid #ddd';
  //     row.appendChild(cell);

  //     const tbody = table.querySelector('tbody');
  //     tbody.appendChild(row);
  //   } else {
  //     // 새로운 테이블을 생성하고 스타일을 적용합니다.
  //     const newTable = document.createElement('table');
  //     newTable.className = 'tablegw';
  //     newTable.style.width = '60%'; // 가로폭 조정
  //     newTable.style.margin = '20px auto'; // 가운데 정렬을 위해 margin 조정
  //     newTable.style.border = '1px solid #ddd';
      
  //     // 새로운 행을 생성하고 데이터를 셀에 추가합니다.
  //     const newRow = document.createElement('tr');
  //     const newCell = document.createElement('td');
  //     newCell.textContent = data;
  //     newCell.style.height = '30px'; // 셀 높이
  //     newCell.style.textAlign = 'center';
  //     newCell.style.border = '1px solid #ddd';
  //     newRow.appendChild(newCell);
      
  //     // 새로운 테이블의 tbody에 새로운 행을 추가합니다.
  //     const newTbody = document.createElement('tbody');
  //     newTbody.appendChild(newRow);
  //     newTable.appendChild(newTbody);
      
  //     // 문서의 body에 새로운 테이블을 추가합니다.
  //     document.body.appendChild(newTable);
  //   }
  // }
  
