document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0); 
    chrome.storage.local.get(['AtnlcScreHakjukInfo'], function (result) {
        makingHakjukTable(result.AtnlcScreHakjukInfo);
    });
    chrome.storage.local.get(['AtnlcScreSungjukInfo'], function (result) {
        makingSungjukTable(result.AtnlcScreSungjukInfo);
        collectGradesAndCredits();
    });
    chrome.storage.local.get(['AtnlcScreSungjukTot'], function (result) {
        displaySungjuk(result.AtnlcScreSungjukTot);
    });
});

// 예상 성적 계산하기 - 테이블 데이터를 array에 저장해서 계산
function collectGradesAndCredits() {
    const gradesCreditsArray = [];

    const tables = document.querySelectorAll('.tablegw');

    for (let table of tables) {
        const th = table.querySelector('thead th').textContent;
        if (th.includes("계절")) {
            continue;
        }
        const rows = table.querySelectorAll('tbody tr');

        // 각 행을 순회하여 데이터 추출
        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            const subject = cells[1].textContent; // 과목명은 두 번째 열에 위치
            const classification = cells[3].textContent;
            const credit = cells[4].textContent; // '학점'은 다섯 번째 열에 위치
            const grade = cells[5].textContent; // '성적'은 여섯 번째 열에 위치

            // P나 NP인 성적은 건너뛰기
            if (grade.includes('P') || grade === '' || grade.includes('삭제')) {
                continue;
            }


            // 추출된 데이터를 배열에 저장
            gradesCreditsArray.push({
                subject: subject,
                classification : classification,
                credit: credit,
                grade: grade
            });

        }
        
    }
    console.log("성적 추출 결과 : ", gradesCreditsArray);

    result = calculateGrades(gradesCreditsArray);
    console.log("페이지에 있는 테이블을 바탕으로 성적 계산 결과 : ", result);

    // 성적 계산 함수
    function calculateGrades(gradesCreditsArray) {
        const gradeToPoint = {
        'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0.0
        };

        let totalPointsHakjuk = 0, totalCreditsHakjuk = 0;
        let majorPointsHakjuk = 0, majorCreditsHakjuk = 0;
        let totalPointsSungjuk = 0, totalCreditsSungjuk = 0;
        let majorPointsSungjuk = 0, majorCreditsSungjuk = 0;

        gradesCreditsArray.forEach(course => {
            const {classification, credit, grade } = course;
            const points = gradeToPoint[grade.trim()];
            const credits = parseFloat(credit);

            // 학적부 기준: F 포함 계산
            totalPointsHakjuk += points * credits;
            totalCreditsHakjuk += credits;

            if (classification.startsWith('전')) {
                majorPointsHakjuk += points * credits;
                majorCreditsHakjuk += credits;
            }

            // 성적표 기준: F 제외 계산
            if (grade.trim() !== 'F') {
                totalPointsSungjuk += points * credits;
                totalCreditsSungjuk += credits;

                if (classification.startsWith('전')) {
                    majorPointsSungjuk += points * credits;
                    majorCreditsSungjuk += credits;
                }
            }
        });

        // 각 평균 계산
        const totalGPAHakjuk = totalCreditsHakjuk ? (totalPointsHakjuk / totalCreditsHakjuk).toFixed(2) : 0;
        const majorGPAHakjuk = majorCreditsHakjuk ? (majorPointsHakjuk / majorCreditsHakjuk).toFixed(2) : 0;
        const totalGPASungjuk = totalCreditsSungjuk ? (totalPointsSungjuk / totalCreditsSungjuk).toFixed(2) : 0;
        const majorGPASungjuk = majorCreditsSungjuk ? (majorPointsSungjuk / majorCreditsSungjuk).toFixed(2) : 0;

        return {
            totalGPAHakjuk,
            majorGPAHakjuk,
            totalGPASungjuk,
            majorGPASungjuk
        };
    }
        
}


// 학적 정보 테이블 생성
function makingHakjukTable(data) {
    const textDiv = document.createElement('h1');
    textDiv.textContent = '성적 시뮬레이션 계산기'; 
    textDiv.style.textAlign = 'center'; 

    document.body.insertBefore(textDiv, document.body.firstChild);

    const table = document.createElement('table');
    table.style.width = '90%'; // 가로폭 조정
    table.style.margin = '0'; 
    table.style.borderCollapse = 'collapse';
    table.style.border = '2px solid #ddd';
    table.style.wordBreak = 'break-all';
    table.style.textOverflow = 'clip';
    table.style.marginBottom = '50px';
    table.style.margin = '15px auto';

    const thead = document.createElement('thead');
    table.appendChild(thead);
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);    

    // table header 데이터 삽입
    const headers = ['학과/학부', '학번', '이름', '학적상황'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerCell.style.textAlign = 'center';
        headerCell.style.height = '25px';
        headerCell.style.backgroundColor = '#cccccc';
        headerCell.style.border = '1px solid #ddd';
        headerRow.appendChild(headerCell);
    });

    // table body 데이터 삽입
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    const rowData = [`${data.hakgwa}`, `${data.hakbun}`, `${data.kname}`, `${data.hakjukStatu}`];
    const row = document.createElement('tr');
    tbody.appendChild(row);

    rowData.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        cell.style.height ='50px'; //셀 높이
        cell.style.textAlign = 'center';
        cell.style.border = '1px solid #ddd';
        row.appendChild(cell);
    });

    document.body.insertBefore(table, textDiv.nextSibling);
}

// 수강 내역 성적 테이블 생성
function makingSungjukTable(dataArray) {
    dataArray.reverse().forEach(data => {
        const table = document.createElement('table');
        table.className = 'tablegw';
        table.style.width = '90%';
        table.style.marginBottom = '30px';
        table.style.borderCollapse = 'collapse';
        table.style.border = '0.5px solid #ddd';
        table.style.wordBreak = 'break-all';
        table.style.textOverflow = 'clip';
        table.style.margin = '15px auto';

        const colgroup = document.createElement('colgroup');
        const colWidths = ['11%', '23%', '15%', '5%', '5%', '10%', '10%', '10%', '10%'];
        colWidths.forEach(width => {
            const col = document.createElement('col');
            col.style.width = width;
            colgroup.appendChild(col);
        });
        table.appendChild(colgroup);

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th colspan="9">${data.thisYear}년도 ${data.hakgiOrder}학기</th>`;
        headerRow.style.height = '25px';
        headerRow.style.backgroundColor = '#ddd';
        headerRow.style.border = '1px solid #ddd';
        thead.appendChild(headerRow);

        const subHeaderRow = document.createElement('tr');
        subHeaderRow.innerHTML = `<th>학정번호</th><th>과목명</th><th>개설학과</th><th>이수구분</th><th>학점</th><th>성적</th><th>인증구분</th><th>재수강여부</th><th>재수강이후 삭제여부</th>`;
        subHeaderRow.style.height = '25px';
        subHeaderRow.style.backgroundColor = '#ddd';
        subHeaderRow.style.border = '1px solid #ddd';
        thead.appendChild(subHeaderRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.sungjukList.forEach(course => {
            const row = document.createElement('tr');
            const retryArray = ['C+', 'C0', 'D+', 'D0'];
            let retakeMarkup = course.retakeOpt === 'Y' ? '<span style="color: red;">재수강</span>' : '';
            row.innerHTML = `
                <td style="text-align: center;">${course.hakjungNo}</td>
                <td style="text-align: center;">${course.gwamokKname}</td>
                <td style="text-align: center;">${course.hakgwa}</td>
                <td style="text-align: center;">${course.codeName1}</td>
                <td style="text-align: center;">${course.hakjumNum}</td>
                <td style="text-align: center;" class="${retryArray.includes(course.getGrade) ? 'editable' : ''}">${course.getGrade}</td>
                <td style="text-align: center;">${course.certname || ''}</td>
                <td style="text-align: center;">${retakeMarkup}</td>
                <td style="text-align: center;">${course.termFinish === 'Y' ? '' : ''}</td>
            `;
            row.style.height = '30px'; //셀 높이
            row.style.border = '1px solid #ddd';
            if (retryArray.includes(course.getGrade)) {
                row.style.backgroundColor = '#F5BCA9';
            }
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        
        var secondChild = document.body.childNodes[1]; 
        document.body.insertBefore(table, secondChild.nextSibling);

        // 이벤트 리스너 추가
        table.addEventListener('click', function(e) {
            if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('editable')) {
                createDropdown(e.target);
            }
        });
    });

    function createDropdown(cell) {
        const existingDropdown = cell.querySelector('select');
        if (!existingDropdown) {
            const dropdown = document.createElement('select');
            const grades = ['A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'NF'];
            grades.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = grade;
                if (cell.textContent === grade) option.selected = true;
                dropdown.appendChild(option);
            });
            dropdown.onchange = function() {
                cell.textContent = this.value; 
                cell.style.backgroundColor = ''; // 색 변경을 초기화
            };
            cell.textContent = ''; 
            cell.appendChild(dropdown); // 드롭다운을 셀에 추가
        }
    }
}



// 성적 계산 표기 테이블 생성 
function displaySungjuk(data) {
    const SungjuckTables = document.createElement('div');
    SungjuckTables.style.display = 'inline-block';


    // 평량 평균 가져오기
    const container = document.createElement('div');
    container.style.marginRight = '10%'; 
    container.style.width = '40%'; 
    container.style.float = 'left'; 
    container.style.marginTop = '20px'; 
    
    const textDiv = document.createElement('h2');
    textDiv.textContent = '성적 정보'; // 텍스트 설정
    container.appendChild(textDiv);

    const table = document.createElement('table');
    table.className = 'sungjuckinfo';
    table.style.width = '90%';
    table.style.marginBottom = '30px';
    table.style.borderCollapse = 'collapse';
    table.style.border = '0.5px solid #ddd';
    table.style.wordBreak = 'break-all';
    table.style.textOverflow = 'clip';
  
    const colgroup = document.createElement('colgroup');
    const colWidths = ['50%', '50%'];
    colWidths.forEach(width => {
        const col = document.createElement('col');
        col.style.width = width;
        colgroup.appendChild(col);
    });
    table.appendChild(colgroup);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headerTitle = document.createElement('th');
    headerTitle.setAttribute('colspan', '2'); // 2열을 합치기
    headerTitle.textContent = '평량평균'; // 헤더 타이틀 설정
    headerTitle.style.height = '30px';
    headerTitle.style.backgroundColor = '#ddd';
    headerTitle.style.border = '1px solid #ddd';
    headerRow.appendChild(headerTitle);
    thead.appendChild(headerRow);

    const subHeaderRow = document.createElement('tr');
    subHeaderRow.innerHTML = `<th>학적부 기준</th><th>성적증명서 기준</th>`;
    subHeaderRow.style.height = '25px';
    subHeaderRow.style.backgroundColor = '#ddd';
    subHeaderRow.style.border = '1px solid #ddd';
    thead.appendChild(subHeaderRow);
    table.appendChild(thead);

    // table body 데이터 삽입
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    const rowData = [`${data.hwakinScoresum}`, `${data.jaechulScoresum}`];
    const row = document.createElement('tr');
    tbody.appendChild(row);

    rowData.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        cell.style.height ='70px'; //셀 높이
        cell.style.textAlign = 'center';
        cell.style.border = '1px solid #ddd';
        row.appendChild(cell);
    });

    container.appendChild(table);
    SungjuckTables.appendChild(container);



    // 시뮬레이션 표기용 성적 테이블 생성
    const containerSimul = document.createElement('div');
    containerSimul.style.marginRight = '10%';
    containerSimul.style.width = '40%';
    containerSimul.style.float = 'right';
    containerSimul.style.marginTop = '20px';

    const textDivSimul = document.createElement('h2');
    textDivSimul.textContent = '예상 성적'; 
    containerSimul.appendChild(textDivSimul);

    const tableSimul = document.createElement('table');
    tableSimul.className = 'sungjuckinfo';
    tableSimul.style.width = '90%';
    tableSimul.style.marginBottom = '30px';
    tableSimul.style.borderCollapse = 'collapse';
    tableSimul.style.border = '0.5px solid #ddd';
    tableSimul.style.wordBreak = 'break-all';
    tableSimul.style.textOverflow = 'clip';

    const colgroupSimul = document.createElement('colgroup');
    const colWidthsSimul = ['25%', '25%', '25%', '25%'];
    colWidthsSimul.forEach(width => {
        const col = document.createElement('col');
        col.style.width = width;
        colgroup.appendChild(col);
    });
    tableSimul.appendChild(colgroupSimul);

    const theadSimul = document.createElement('thead');
    const headerRowSimul = document.createElement('tr');
    headerRowSimul.innerHTML = `<th colspan="2">학적부 기준</th><th colspan="2">성적표 기준</th>`;
    headerRowSimul.style.height = '25px';
    headerRowSimul.style.backgroundColor = '#ddd';
    headerRowSimul.style.border = '1px solid #ddd';
    theadSimul.appendChild(headerRowSimul);

    const subHeaderRowSimul = document.createElement('tr');
    subHeaderRowSimul.innerHTML = `<th>전공 성적</th><th>전체 성적</th><th>전공 성적</th><th>전체 성적</th>`;
    subHeaderRowSimul.style.height = '25px';
    subHeaderRowSimul.style.backgroundColor = '#ddd';
    subHeaderRowSimul.style.border = '1px solid #ddd';
    theadSimul.appendChild(subHeaderRowSimul);
    tableSimul.appendChild(theadSimul);

    const tbodySimul = document.createElement('tbody');
    const bodyRow = document.createElement('tr');
    bodyRow.innerHTML = `<td>-</td><td>-</td><td>-</td><td>-</td>`;
    bodyRow.style.height = '70px';
    bodyRow.style.textAlign = 'center';
    bodyRow.style.border = '1px solid #ddd';
    tbodySimul.appendChild(bodyRow);
    tableSimul.appendChild(tbodySimul);

    containerSimul.appendChild(tableSimul);
    SungjuckTables.appendChild(containerSimul);
    
    var secondChild = document.body.childNodes[1]; 
    document.body.insertBefore(SungjuckTables, secondChild.nextSibling);

}
