document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0); 

    chrome.storage.local.get(['AtnlcScreHakjukInfo'], function (result) {
        makingHakjukTable(result.AtnlcScreHakjukInfo);
    });
    chrome.storage.local.get(['AtnlcScreSungjukInfo'], function (result) {
        // 수강 내역 테이블 생성 
        makingSungjukTable(result.AtnlcScreSungjukInfo);
        let temp = result.AtnlcScreSungjukInfo;
        console.log("F 테이블 만드는 데 쓰는 데이터 : ",temp);
        makingFTable(temp);
        
    });
    chrome.storage.local.get(['AtnlcScreSungjukTot'], function (result) {
        displaySungjuk(result.AtnlcScreSungjukTot);
        // 지연 시키고, collectGradesAndCredits() 실행하기
        delay(function () {
            createEditTable();

            collectGradesAndCredits();
        }, 100); 
    });


});

// 지연 함수
function delay(callback, milliseconds) {
    setTimeout(callback, milliseconds);
}

// 예상 성적 계산하기 - 테이블 데이터를 array에 저장해서 계산
function collectGradesAndCredits() {
    const gradesCreditsArray = [];
    const gradesList = ['전필','전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];

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
            if (!gradesList.includes(classification)) {
                continue;
            }         

            if (grade.trim() == 'A+A0B+B0C+C0D+D0FNF') {
                continue;
            }
            
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
    const simulationTable = document.querySelector('.sungjuckCal');


    // 결과 테이블 업데이트
    const tbody = simulationTable.querySelector('tbody');
    tbody.innerHTML = '';  // 기존 테이블 데이터 클리어
    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${result.majorGPAHakjuk}</td><td>${result.totalGPAHakjuk}</td><td>${result.majorGPASungjuk}</td><td>${result.totalGPASungjuk}</td>`;
    newRow.style.height = '70px';
    newRow.style.textAlign = 'center';
    newRow.style.border = '1px solid #ddd';
    tbody.appendChild(newRow);
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
    table.style.width = '70%'; // 가로폭 조정
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
        headerCell.style.backgroundColor = '#72132F';
        headerCell.style.border = '1px solid #ddd';
        headerCell.style.color = 'white';
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
        table.style.width = '70%';
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
        headerRow.style.backgroundColor = '#72132F';
        headerRow.style.border = '1px solid #ddd';
        headerRow.style.color = 'white';
        thead.appendChild(headerRow);

        const subHeaderRow = document.createElement('tr');
        subHeaderRow.innerHTML = `<th>학정번호</th><th>과목명</th><th>개설학과</th><th>이수구분</th><th>학점</th><th>성적</th><th>인증구분</th><th>재수강여부</th><th>재수강이후 삭제여부</th>`;
        subHeaderRow.style.height = '25px';
        subHeaderRow.style.backgroundColor = '#72132F';
        subHeaderRow.style.border = '1px solid #ddd';
        subHeaderRow.style.color = 'white';

        thead.appendChild(subHeaderRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.sungjukList.forEach(course => {
            const row = document.createElement('tr');

            const retryArray = ['C+', 'C0', 'D+', 'D0', ];
            let retakeMarkup = course.retakeOpt === 'Y' ? '<span style="color: red;">재수강</span>' : '';
            const trimGrade = course.getGrade.trim(); // 성적에서 공백 제거
            
            row.innerHTML = `
                <td style="text-align: center;">${course.hakjungNo}</td>
                <td style="text-align: center;">${course.gwamokKname}</td>
                <td style="text-align: center;">${course.hakgwa}</td>
                <td style="text-align: center;">${course.codeName1}</td>
                <td style="text-align: center;">${course.hakjumNum}</td>
                <td style="text-align: center;" class="${retryArray.includes(trimGrade) ? 'editable' : (trimGrade === '' ? 'thisSemester' : '')}">${course.getGrade}</td>

                <td style="text-align: center;">${course.certname || ''}</td>
                <td style="text-align: center;">${retakeMarkup}</td>
                <td style="text-align: center;">${course.termFinish === 'Y' ? '' : ''}</td>
            `;
            
            row.style.height = '30px'; //셀 높이
            row.style.border = '1px solid #ddd';

            if (course.getGrade.includes('삭제')) {
                row.classList.add('strikeout'); // CSS 클래스 추가
            }
            if (retryArray.includes(trimGrade)) {
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
                createDropdown1(e.target);
            }
            if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('thisSemester')) {
                createDropdown2(e.target);

            }
        });
    });

}

// F 받은 과목 모아서 테이블 생성
function makingFTable(dataArray) {
    let fSungjuckTemp = [];
    let fSungjuckList = [];
    dataArray.forEach(data => {
        data.sungjukList.forEach((course, index) => { // 두 번째 매개변수로 인덱스를 받습니다.
            const trimGrade = course.getGrade.trim();
            if (trimGrade == "F") {
                fSungjuckTemp.push(course);
                data.sungjukList.splice(index, 1);
            }
        });
    });

    fSungjuckList.forEach(fCourse => {
            const hakjungNo = fCourse.hakjungNo;
            fSungjuckList = fSungjuckList.filter(course => course.hakjungNo !== hakjungNo);
        });
    
    if (makingFTable.length != 0) {
        const table = document.createElement('table');
        table.className = 'tablegw';
        table.style.width = '70%';
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
        headerRow.innerHTML = `<th colspan="9">F성적(F는 성적표 기준 제외 후 계산, 학적부 기준 F 포함 후 계산)`;
        headerRow.style.height = '25px';
        headerRow.style.backgroundColor = '#72132F';
        headerRow.style.border = '1px solid #ddd';
        headerRow.style.color = 'white';

        thead.appendChild(headerRow);

        const subHeaderRow = document.createElement('tr');
        subHeaderRow.innerHTML = `<th>학정번호</th><th>과목명</th><th>개설학과</th><th>이수구분</th><th>학점</th><th>성적</th><th>인증구분</th><th>재수강여부</th><th>재수강이후 삭제여부</th>`;
        subHeaderRow.style.height = '25px';
        subHeaderRow.style.backgroundColor = '#72132F';
        subHeaderRow.style.border = '1px solid #ddd';
        subHeaderRow.style.color = 'white';

        thead.appendChild(subHeaderRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        fSungjuckList.forEach(course => {
            const row = document.createElement('tr');

            const retryArray = ['F'];
            let retakeMarkup = course.retakeOpt === 'Y' ? '<span style="color: red;">재수강</span>' : '';
            const trimGrade = course.getGrade.trim(); // 성적에서 공백 제거
            
            row.innerHTML = `
                <td style="text-align: center;">${course.hakjungNo}</td>
                <td style="text-align: center;">${course.gwamokKname}</td>
                <td style="text-align: center;">${course.hakgwa}</td>
                <td style="text-align: center;">${course.codeName1}</td>
                <td style="text-align: center;">${course.hakjumNum}</td>
                <td style="text-align: center;" class="${retryArray.includes(trimGrade) ? 'editable' : (trimGrade === '' ? 'thisSemester' : '')}"></td>
                <td style="text-align: center;">${course.certname || ''}</td>
                <td style="text-align: center;">${retakeMarkup}</td>
                <td style="text-align: center;">${course.termFinish === 'Y' ? '' : ''}</td>
            `;
            
            row.style.height = '30px'; //셀 높이
            row.style.border = '1px solid #ddd';

            if (course.getGrade.includes('삭제')) {
                row.classList.add('strikeout'); // CSS 클래스 추가
            }

            tbody.appendChild(row);
        });
        table.appendChild(tbody);
    
        var secondChild = document.body.childNodes[1];
        document.body.insertBefore(table, secondChild.nextSibling);
    
        // 이벤트 리스너 추가
        table.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('editable')) {
                createDropdown2(e.target);
            }
        });
    }
}




// 성적 정보 테이블 생성 
function displaySungjuk(data) {
    const SungjuckTables = document.createElement('div');
    SungjuckTables.style.display = 'flex'; // 가로로 배치
    SungjuckTables.style.justifyContent = 'space-around'; // 컨테이너 사이의 간격 조절
    SungjuckTables.style.width = '100%'; // 전체 너비 사용
    SungjuckTables.style.marginTop = '20px'; // 상단 여백 설정

    // 성적 정보 테이블 컨테이너
    const container = document.createElement('div');
    container.style.width = '35%'; // 컨테이너 너비 
    container.style.marginRight = '20px'; // 오른쪽 마진 고정

    const textDiv = document.createElement('h2');
    textDiv.textContent = '성적 정보'; // 테이블 제목
    container.appendChild(textDiv);

    const table = document.createElement('table');
    table.className = 'sungjuckinfo';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #ddd';
    table.style.marginBottom = '30px';
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
    headerTitle.setAttribute('colspan', '2');
    headerTitle.textContent = '평량평균';
    headerTitle.style.backgroundColor = '#72132F';
    headerTitle.style.border = '1px solid #ddd';
    headerTitle.style.color = 'white';

    headerRow.appendChild(headerTitle);
    thead.appendChild(headerRow);

    const subHeaderRow = document.createElement('tr');
    subHeaderRow.innerHTML = `<th>학적부 기준</th><th>성적증명서 기준</th>`;
    subHeaderRow.style.backgroundColor = '#72132F';
    subHeaderRow.style.color = 'white';

    thead.appendChild(subHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const bodyRow = document.createElement('tr');
    bodyRow.innerHTML = `<td>${data.hwakinScoresum}</td><td>${data.jaechulScoresum}</td>`;
    tbody.appendChild(bodyRow);
    table.appendChild(tbody);

    container.appendChild(table);
    SungjuckTables.appendChild(container);

    // 예상 성적 테이블 컨테이너
    const containerSimul = document.createElement('div');
    containerSimul.style.width = '45%'; // 컨테이너 너비 50% 설정

    // 제목과 계산하기 버튼을 포함할 헤더 컨테이너
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.justifyContent = 'space-between'; // 제목과 버튼 사이의 간격 최대화

    const textDivSimul = document.createElement('h2');
    textDivSimul.textContent = '예상 성적';
    headerContainer.appendChild(textDivSimul);

    const calculateButton = document.createElement('button');
    calculateButton.textContent = '계산하기';
    calculateButton.style.padding = '5px 15px';
    headerContainer.appendChild(calculateButton); // 제목 옆에 계산하기 버튼 추가

    containerSimul.appendChild(headerContainer);

    const tableSimul = document.createElement('table');
    tableSimul.className = 'sungjuckCal';
    tableSimul.style.width = '100%';
    tableSimul.style.borderCollapse = 'collapse';
    tableSimul.style.border = '1px solid #ddd';
    tableSimul.style.marginBottom = '30px';
    tableSimul.style.wordBreak = 'break-all';
    tableSimul.style.textOverflow = 'clip';

    const colgroupSimul = document.createElement('colgroup');
    const colWidthsSimul = ['25%', '25%', '25%', '25%'];
    colWidthsSimul.forEach(width => {
        const col = document.createElement('col');
        col.style.width = width;
        colgroupSimul.appendChild(col);
    });
    tableSimul.appendChild(colgroupSimul);

    const theadSimul = document.createElement('thead');
    const headerRowSimul = document.createElement('tr');
    headerRowSimul.innerHTML = `<th colspan="2">학적부 기준</th><th colspan="2">성적표 기준</th>`;
    bodyRow.style.height = '25px';
    bodyRow.style.textAlign = 'center';
    bodyRow.style.border = '1px solid #ddd';
    headerRowSimul.style.backgroundColor = '#72132F';
    headerRowSimul.style.color = 'white';

    theadSimul.appendChild(headerRowSimul);

    const subHeaderRowSimul = document.createElement('tr');
    subHeaderRowSimul.innerHTML = `<th>전공 성적</th><th>전체 성적</th><th>전공 성적</th><th>전체 성적</th>`;
    bodyRow.style.height = '70px';
    bodyRow.style.textAlign = 'center';
    bodyRow.style.border = '1px solid #ddd';
    subHeaderRowSimul.style.backgroundColor = '#72132F';
    subHeaderRowSimul.style.color = 'white';


    theadSimul.appendChild(subHeaderRowSimul);
    tableSimul.appendChild(theadSimul);

    const tbodySimul = document.createElement('tbody');
    const bodyRowSimul = document.createElement('tr');
    bodyRowSimul.innerHTML = `<td>-</td><td>-</td><td>-</td><td>-</td>`;
    bodyRow.style.height = '70px';
    bodyRow.style.textAlign = 'center';
    bodyRow.style.border = '1px solid #ddd';
    tbodySimul.appendChild(bodyRowSimul);
    tableSimul.appendChild(tbodySimul);

    containerSimul.appendChild(tableSimul);
    SungjuckTables.appendChild(containerSimul);

    // 페이지에 테이블 추가
    var secondChild = document.body.childNodes[1]; 
    document.body.insertBefore(SungjuckTables, secondChild.nextSibling);

    // 계산하기 버튼 클릭 이벤트 설정
    calculateButton.addEventListener('click', function () {
        collectGradesAndCredits();
    });

    
}

// 과목 추가 테이블
function createEditTable() {
    const table = document.createElement('table');
    table.className = 'tablegw';
    table.style.width = '70%';
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
    headerRow.innerHTML = `<th colspan="9">졸업까지 수강 예정 과목`;
    headerRow.style.height = '25px';
    headerRow.style.backgroundColor = '#72132F';
    headerRow.style.border = '1px solid #ddd';
    headerRow.style.color = 'white';

    thead.appendChild(headerRow);

    const subHeaderRow = document.createElement('tr');
    subHeaderRow.innerHTML = `<th>학정번호</th><th>과목명</th><th>개설학과</th><th>이수구분</th><th>학점</th><th>성적</th><th>인증구분</th><th>재수강여부</th><th>재수강이후 삭제여부</th>`;
    subHeaderRow.style.height = '25px';
    subHeaderRow.style.backgroundColor = '#72132F';
    subHeaderRow.style.border = '1px solid #ddd';
    subHeaderRow.style.color = 'white';

    thead.appendChild(subHeaderRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
        
    const newRow = createEditableRow(); // 새로운 행 생성
    tbody.appendChild(newRow); // 생성된 행을 tbody에 추가
    

    table.appendChild(tbody);

    // 테이블에 행 추가하는 함수
    function addRow() {
        const newRow = createEditableRow();
        tbody.appendChild(newRow);
    }

    // 헤더 행에 버튼 삽입
    const addButtonCell = document.createElement('th');
    addButtonCell.style.textAlign = 'center';
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.addEventListener('click', addRow);
    addButtonCell.appendChild(addButton);
    headerRow.appendChild(addButtonCell);

    var secondChild = document.body.childNodes[2]; 
    document.body.insertBefore(table, secondChild.nextSibling);

    // 테이블 편집 가능한 셀에 클릭 이벤트 리스너 추가
    table.addEventListener('click', function(e) {
        if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('editable')) {
            createDropdown2(e.target);
        }
        if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('editIsuTable')) {
            createDropdownIsu(e.target);
        }
    });
}

// 테이블에 새로운 행 생성하는 함수
function createEditableRow() {
    const row = document.createElement('tr');
    const columns = ['학정번호', '과목명', '개설학과', '이수구분', '학점', '성적', '인증구분', '재수강여부', '재수강이후 삭제여부'];
    
    columns.forEach(columnName => {
        const cell = document.createElement('td');
        cell.style.textAlign = 'center';
        cell.textContent = ''; // 초기 내용은 비워둠

        switch (columnName) {
            case '학정번호':
                cell.textContent = '-';
                break;
            case '과목명':
                cell.contentEditable = true;
                break;
            case '개설학과':
                cell.textContent = '-';
                break;
            case '이수구분':
                cell.textContent = '선택하세요';
                cell.classList.add('editIsuTable');
                break;
            case '학점':
                cell.textContent = '3'; // 기본 학점은 3
                cell.contentEditable = true; // 사용자가 수정 가능
                break;
            case '성적':
                cell.classList.add('editable'); // 수정 가능한 셀에 클래스 추가
                break;
            default:
                break;
        }

        row.appendChild(cell);
    });

    return row;
}

// 성적 선택 토글
// 재수강 시 => A+ 제외
function createDropdown1(cell) {
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
        dropdown.value = cell.textContent.trim(); // 기존 값 선택

        dropdown.onchange = function() {
            cell.textContent = this.value; 
            cell.style.backgroundColor = ''; // 색 변경을 초기화
        };
        cell.textContent = ''; 
        cell.appendChild(dropdown); // 드롭다운을 셀에 추가
    }
}

// F 혹은 이번 학기 성적 선택
function createDropdown2(cell) {
    const existingDropdown = cell.querySelector('select');
    if (!existingDropdown) {
        const dropdown = document.createElement('select');
        const grades = ['A+','A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'NF'];
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            if (cell.textContent.trim() === grade) option.selected = true; // trim() 메서드를 사용하여 문자열 앞뒤의 공백을 제거합니다.
            dropdown.appendChild(option);
        });
        dropdown.value = cell.textContent.trim(); // 기존 값 선택

        dropdown.onchange = function() {
            cell.textContent = this.value; 
            cell.style.backgroundColor = ''; // 색 변경을 초기화
        };
        cell.textContent = ''; 
        cell.appendChild(dropdown); // 드롭다운을 셀에 추가
    }
}

// 이수 구분 선택하는 토글
function createDropdownIsu(cell) {
    const existingDropdown = cell.querySelector('select');
    if (!existingDropdown) {
        const dropdown = document.createElement('select');
        const grades = ['전필','전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = grade;
            dropdown.appendChild(option);
        });
        dropdown.value = cell.textContent.trim(); // 기존 값 선택
        dropdown.onchange = function() {
            const selectedValue = this.value;
            cell.textContent = selectedValue; 
            cell.style.backgroundColor = ''; // 색 변경을 초기화
        };
        cell.textContent = ''; 
        cell.appendChild(dropdown); // 드롭다운을 셀에 추가
    }
}

