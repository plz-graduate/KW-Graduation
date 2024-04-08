

// 테이블 생성 및 페이지에 삽입하는 함수
function createAndInsertTable(data, completedCourses) {
  // 테이블 요소 생성
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.marginTop = '20px';
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
    headerCell.style.backgroundColor= '#f5f5f5';
    headerRow.appendChild(headerCell);
  });

  // 테이블 본문 생성
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  // JSON 데이터를 통해 테이블 행 생성
  Object.keys(data.requiredCourses).forEach(category => {
    data.requiredCourses[category].forEach(course => {
      const courseID = course.id;
      const courseStatus = completedCourses[courseID] ? 
                           (completedCourses[courseID] === 'F' || completedCourses[courseID] === 'NP' ? "수강 필요" : "수강 완료") : 
                           "수강 필요";

      const row = document.createElement('tr');
      const idCell = document.createElement('td');
      const nameCell = document.createElement('td');
      const categoryCell = document.createElement('td');
      const statusCell = document.createElement('td');

      idCell.textContent = course.id;
      nameCell.textContent = course.name;
      categoryCell.textContent = category;
      statusCell.textContent = courseStatus;


      if (courseStatus === "수강 필요") {
        statusCell.style.color = 'red';
        statusCell.style.fontWeight = 'bold';
      }

      if (courseStatus === "수강 완료") {
        statusCell.style.color = 'blue';
        statusCell.style.fontWeight = 'bold';
      }
  

      [idCell, nameCell, categoryCell, statusCell].forEach(cell => {
        cell.style.textAlign = 'center';
        cell.style.border =  '1px solid #ddd';
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
  });

  // .tablegw 클래스를 가진 첫 번째 요소를 찾아 그 다음 위치에 테이블 삽입
  const insertionPoint = document.querySelector('.tablegw');
  if (insertionPoint) {
    insertionPoint.parentNode.insertBefore(table, insertionPoint.nextSibling);
  } else {
    document.body.appendChild(table);
  }
}



// 수강 성적 페이지에서 수강 완료 과목의 학정번호와 성적을 추출하는 함수
function extractCompletedCourses() {
  const completedCourses = {};
  const rows = document.querySelectorAll('.AType tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length > 5) { // 성적이 포함된 셀에 접근하기 전에 충분한 셀이 있는지 확인
      const courseID = cells[0].textContent.trim().split('-')[2];
      const grade = cells[5].textContent.trim(); // 성적이 6번째 셀에 있다고 가정
    completedCourses[courseID] = grade;
  }});
  console.log(completedCourses);
  return completedCourses;
  
}


// 취득학점 정보 추출 및 남은 학점 계산 함수
function calculateRemainingCredits() {
  // 취득학점 정보가 있는 테이블 선택 (두 번째 '.tablegw')
  const creditInfoTable = document.querySelectorAll('.tablegw')[1];
  if (!creditInfoTable) {
    console.error("취득학점 정보 테이블을 찾을 수 없습니다.");
    return { major: 0, totalRequired: 0 }; // 오류 시 기본 값 반환
  }

  const rows = creditInfoTable.querySelectorAll('tbody tr')[0].cells; // 첫 번째 행의 셀들 선택
  const majorCredits = parseInt(rows[8].textContent, 10) || 0; // 전공 취득학점
  const totalAcquiredCredits = parseInt(rows[11].textContent, 10) || 0; // 총 취득학점
  
  // 졸업 요건 학점
  const graduationRequirements = { major: 60, totalRequired: 133 };

  // 남은 학점 계산
  const remainingCredits = {
    major: Math.max(0, graduationRequirements.major - majorCredits), // 남은 전공 학점
    totalRequired: Math.max(0, graduationRequirements.totalRequired - totalAcquiredCredits) // 졸업까지 필요한 총 학점
  };

  return remainingCredits; // 계산된 남은 학점 객체 반환
}

// 남은 학점 표시
function displayRemainingCredits(data, completedCourses) {
  const remainingCreditsInfo = calculateRemainingCredits(); // 남은 학점 계산 함수 호출 결과

  // 남은 학점 정보를 표시할 요소 생성
  const remainingCreditsDiv = document.createElement('div');
  remainingCreditsDiv.style.marginTop = '20px'; // 상단 여백 설정
  remainingCreditsDiv.innerHTML = `
    <strong>남은 학점 정보</strong>
    <p>전공 필요 학점: ${remainingCreditsInfo.major}학점</p>
    <p>총 필요 학점(전공 포함): ${remainingCreditsInfo.totalRequired}학점</p>
  `;

  // .tablegw 클래스를 가진 첫 번째 요소 바로 다음 위치에 남은 학점 정보 삽입
  const insertionPoint = document.querySelector('.tablegw + table');
  if (insertionPoint) {
    insertionPoint.parentNode.insertBefore(remainingCreditsDiv, insertionPoint.nextSibling);
  } else {
    console.error('수강 여부 테이블을 찾을 수 없습니다.');
  }
}


// JSON 파일 로드 및 실행 로직
fetch(chrome.runtime.getURL('data/informationConvergence.json'))
  .then(response => response.json())
  .then(data => {
    const completedCourses = extractCompletedCourses(); // 수강 완료 과목 정보 추출
    createAndInsertTable(data, completedCourses); // 테이블 생성 및 삽입
    displayRemainingCredits(data, completedCourses); // 남은 학점 정보 표시
  })
  .catch(error => console.error('Error loading JSON:', error));

  // 교양 이수 현황 업데이트 함수
function updateGyoyangIsuTable() {
  // HTML 페이지 가져오기
  fetch('https://klas.kw.ac.kr/std/cps/inqire/GyoyangIsuStdPage.do')
      .then(response => response.text())
      .then(htmlString => {
          // JSON 데이터 가져오기
          return fetch('/std/cps/inqire/GyoyangIsuInfo.do', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({})
          })
          .then(response => response.json())
          .then(jsonData => {
              html = `<br><br> `
              // 교양 이수 현황 계산
              let remainGyoyang = checkingGyoyangIsu(jsonData);
              if(remainGyoyang){
                  for (let key in remainGyoyang) {
                      html += `${key}: ${remainGyoyang[key]}`;
                      html += `<br>`;
                  }
              }

              // 교양 이수 현황 table 불러오기
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlString, 'text/html');
              const table = doc.querySelector('#appModule > div > table:nth-child(3)');
              html += `<br> ` + table.outerHTML;

              let updatedHtml = html
                  .replace('{{sugang.aa8128}}', jsonData.aa8128)
                  .replace('{{sugang.aa3362}}', jsonData.aa3362)
                  .replace('{{sugang.aa76}}', jsonData.aa76)
                  .replace('{{sugang.aa64}}', jsonData.aa64)
                  .replace('{{sugang.aa63}}', jsonData.aa63)
                  .replace('{{sugang.aa65}}', jsonData.aa65)
                  .replace('{{sugang.aa66}}', jsonData.aa66)
                  .replace('{{sugang.aa67}}', jsonData.aa67)
                  .replace('{{sugang.aa68}}', jsonData.aa68)
                  .replace('{{sugang.aa7881}}', jsonData.aa7881)
                  // 필요한 만큼 추가적인 데이터 필드 반복
                  .replace('{{totHakjum}}', Object.values(jsonData).reduce((a, b) => a + b, 0));


              // 삽입 위치 선정 및 HTML 삽입
              const insertLocation = document.querySelector('.tablegw');
              if (insertLocation && updatedHtml) {
                  insertLocation.insertAdjacentHTML('afterend', `<br>${updatedHtml}`);
              }


          });
      })
      .catch(error => console.error('Fetching error:', error));
}

// 필수 교양 및 균형 교양 확인 및 계산
function checkingGyoyangIsu(jsonData){
    let sugang = {};
    // 필수 교양 체크
    if (jsonData.aa8128 != 3){
        sugang["광운인되기"] = jsonData.aa8128;
    }
    if (jsonData.aa3362 != 3){
        sugang["대학영어"] = jsonData.aa3362;
    }
    if (jsonData.aa76 < 6 ){
        sugang["정보영역"] = jsonData.aa76;
    }
    if (jsonData.aa64 != 3){
        sugang["융합적사고와글쓰기영역"] = jsonData.aa64;
    }

    // 균형 교양 체크
    let cnt = 0;
    if (jsonData.aa63 >= 3){
        cnt += 1;
    }
    if (jsonData.aa65 >= 3){
        cnt += 1;
    }
    if (jsonData.aa66 >= 3){
        cnt += 1;
    }
    if (jsonData.aa67 >= 3){
        cnt += 1;
    }
    if(jsonData.aa68 >=3){
        cnt+=1;
    }

    if(cnt < 3){
        sugang["균형교양"] = cnt;
    }

    return sugang;
}

// 페이지 로드가 완료되면 교양 이수 현황 업데이트 함수 실행
window.addEventListener('load', updateGyoyangIsuTable);