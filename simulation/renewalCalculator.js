// 1. DOMContentLoaded 이벤트 리스너
document.addEventListener("DOMContentLoaded", function () {
    window.scrollTo(0, 0);

    chrome.storage.local.get(['AtnlcScreHakjukInfo'], function (result) {
        makingHakjukTable(result.AtnlcScreHakjukInfo);
    });
    chrome.storage.local.get(['AtnlcScreSungjukInfo'], function (result) {
        // 수강 내역 테이블 생성
        makingSungjukTable(result.AtnlcScreSungjukInfo);
        makingFTable(result.AtnlcScreSungjukInfo);
    });
    chrome.storage.local.get(['AtnlcScreSungjukTot', 'AtnlcScreSungjukInfo'], function (result) {
        displaySungjuk(result.AtnlcScreSungjukTot, result.AtnlcScreSungjukInfo);
        // 지연 시키고, collectGradesAndCredits() 실행하기
        delay(function () {
            collectGradesAndCredits(result.AtnlcScreSungjukInfo);
        }, 100);
    });
});

function delay(callback, milliseconds) {
    setTimeout(callback, milliseconds);
}

// 1. 학적 정보 삽입하기
function makingHakjukTable(data) {
    // 학적 정보 값 설정
    document.getElementById('hakgwa').textContent = data.hakgwa;
    document.getElementById('hakbun').textContent = data.hakbun;
    document.getElementById('kname').textContent = data.kname;
    document.getElementById('hakjukStatu').textContent = data.hakjukStatu;
}

// 2. 성적 불러오기
function displaySungjuk(data) {
    // 학적부 기준 값 설정
    const hakjukAvgValue = document.getElementById('hakjukAvgValue');
    hakjukAvgValue.textContent = data.hwakinScoresum;

    // 성적증명서 기준 값 설정
    const sungjukAvgValue = document.getElementById('sungjukAvgValue');
    sungjukAvgValue.textContent = data.jaechulScoresum;
}

// 3. 수강 내역 불러오기
function makingSungjukTable(dataArray) {
    const container = document.querySelector('.classTable');
    container.innerHTML = ''; // 기존 테이블 초기화

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

            row.style.height = '30px'; // 셀 높이
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

        container.appendChild(table); // 테이블을 classTable div에 추가

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

// 4. F 학점 받고 재수강 안한 과목 모음
function makingFTable(dataArray) {
    const container = document.querySelector('.fTable');

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

    if (data.length != 0) {
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

        container.appendChild(table);


        // 이벤트 리스너 추가
        table.addEventListener('click', function (e) {
            if (e.target && e.target.nodeName === 'TD' && e.target.classList.contains('editable')) {
                createDropdown2(e.target);
            }
        });
    }
}