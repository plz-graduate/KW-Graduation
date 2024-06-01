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

    //계산하기 버튼
    document.getElementById('calculateButton').addEventListener('click', function () {
        chrome.storage.local.get(['AtnlcScreSungjukInfo'], function (result) {
            collectGradesAndCredits(result.AtnlcScreSungjukInfo);
        });
    });

    // 드롭다운 요소에 이벤트 리스너 추가
    document.querySelectorAll('#plannedCoursesTable select').forEach(select => {
        select.addEventListener('change', function() {
            updateCellText(this);
        });
    });


    // + 버튼
    document.querySelector('#btn-plus').addEventListener('click', function() {
        // 새로운 행 생성
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>-</td>
            <td><input type="text" class="form-control" /></td>
            <td>-</td>
            <td>
                <select class="form-select" onchange="updateCellText(this)">
                    <option value="전필">전필</option>
                    <option value="전선">전선</option>
                    <option value="부필">부필</option>
                    <option value="부선">부선</option>
                    <option value="복필">복필</option>
                    <option value="복선">복선</option>
                    <option value="교필">교필</option>
                    <option value="교선">교선</option>
                    <option value="기필">기필</option>
                    <option value="기선">기선</option>
                </select>
            </td>
            <td>
                <select class="form-select" onchange="updateCellText(this)">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </td>
            <td>
                <select class="form-select" onchange="updateCellText(this)">
                    <option value="A+">A+</option>
                    <option value="A0">A0</option>
                    <option value="B+">B+</option>
                    <option value="B0">B0</option>
                    <option value="C+">C+</option>
                    <option value="C0">C0</option>
                    <option value="D+">D+</option>
                    <option value="D0">D0</option>
                    <option value="F">F</option>
                    <option value="P">P</option>
                    <option value="NP">NP</option>
                </select>
            </td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
        `;

        // 테이블에 새로운 행 추가
        document.querySelector('#plannedCoursesTable').appendChild(newRow);

        // 새로 추가된 행의 드롭다운에도 이벤트 리스너 추가
        newRow.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', function() {
                updateCellText(this);
            });
        });

        // 새로 추가된 행의 셀에 클릭 이벤트 리스너 추가
        newRow.querySelectorAll('td').forEach(cell => {
            if (cell.cellIndex === 3 || cell.cellIndex === 4 || cell.cellIndex === 5) {
                cell.addEventListener('click', function() {
                    if (this.querySelector('select')) {
                        return;
                    }
                    const textContent = this.textContent.trim();
                    const select = document.createElement('select');
                    select.classList.add('form-select');
                    let options = [];

                    if (this.cellIndex === 3) {
                        options = ['전필', '전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];
                    } else if (this.cellIndex === 4) {
                        options = ['1', '2', '3', '4', '5', '6'];
                    } else if (this.cellIndex === 5) {
                        options = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];
                    }

                    options.forEach(optionText => {
                        const option = document.createElement('option');
                        option.value = optionText;
                        option.text = optionText;
                        if (optionText === textContent) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });

                    this.innerHTML = '';
                    this.appendChild(select);

                    select.addEventListener('change', function() {
                        updateCellText(this);
                    });
                });
            }
        });
    });

    // 기존 행의 드롭다운에도 이벤트 리스너 추가
    document.querySelectorAll('#plannedCoursesTable select').forEach(select => {
        select.addEventListener('change', function() {
            updateCellText(this);
        });
    });

    // 클릭 이벤트 리스너 추가
    document.querySelectorAll('#plannedCoursesTable td').forEach(cell => {
        if (cell.cellIndex === 3 || cell.cellIndex === 4 || cell.cellIndex === 5) {
            cell.addEventListener('click', function() {
                if (this.querySelector('select')) {
                    return;
                }
                const textContent = this.textContent.trim();
                const select = document.createElement('select');
                select.classList.add('form-select');
                let options = [];

                if (this.cellIndex === 3) {
                    options = ['전필', '전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];
                } else if (this.cellIndex === 4) {
                    options = ['1', '2', '3', '4', '5', '6'];
                } else if (this.cellIndex === 5) {
                    options = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];
                }

                options.forEach(optionText => {
                    const option = document.createElement('option');
                    option.value = optionText;
                    option.text = optionText;
                    if (optionText === textContent) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                this.innerHTML = '';
                this.appendChild(select);

                select.addEventListener('change', function() {
                    updateCellText(this);
                });
            });
        }
    });
});

function updateCellText(selectElement) {
    const selectedValue = selectElement.value;
    const cell = selectElement.parentElement;
    cell.innerHTML = selectedValue;
    cell.addEventListener('click', function() {
        if (cell.querySelector('select')) {
            return;
        }
        const textContent = cell.textContent.trim();
        const newSelect = document.createElement('select');
        newSelect.classList.add('form-select');
        let options = [];

        if (cell.cellIndex === 3) {
            options = ['전필', '전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];
        } else if (cell.cellIndex === 4) {
            options = ['1', '2', '3', '4', '5', '6'];
        } else if (cell.cellIndex === 5) {
            options = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP'];
        }

        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.text = optionText;
            if (optionText === textContent) {
                option.selected = true;
            }
            newSelect.appendChild(option);
        });

        cell.innerHTML = '';
        cell.appendChild(newSelect);

        newSelect.addEventListener('change', function() {
            updateCellText(this);
        });
    });
}

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

    dataArray.forEach(data => {
        const table = document.createElement('table');
        table.className = 'tablegw';
        table.style.width = '100%';
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
        headerRow.style.backgroundColor = '#efefef';
        headerRow.style.border = '1px solid #d7d7d7';
        headerRow.style.color = '#474747';
        headerRow.style.textAlign="center";
        thead.appendChild(headerRow);

        const subHeaderRow = document.createElement('tr');
        subHeaderRow.innerHTML = `<th>학정번호</th><th>과목명</th><th>개설학과</th><th>이수구분</th><th>학점</th><th>성적</th><th>인증구분</th><th>재수강여부</th><th>재수강이후 삭제여부</th>`;
        subHeaderRow.style.height = '25px';
        subHeaderRow.style.backgroundColor = '#efefef';
        subHeaderRow.style.border = '1px solid #d7d7d7';
        subHeaderRow.style.color = '#474747';
        subHeaderRow.style.padding = '15px auto';

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

// 5. 예상 성적 계산하기
// 수강 내역 데이터를 사전 형태로 변환
function createSungjukMap(AtnlcScreSungjukInfo) {
    const sungjukMap = new Map();
    AtnlcScreSungjukInfo.forEach(data => {
        if (Array.isArray(data.sungjukList)) {
            data.sungjukList.forEach(course => {
                sungjukMap.set(course.hakjungNo, course);
            });
        } else {
            console.log("sungjukList가 배열이 아님:", data.sungjukList);
        }
    });
    return sungjukMap;
}
// 예상 성적 계산하기 - 테이블 데이터를 array에 저장해서 계산
function collectGradesAndCredits(AtnlcScreSungjukInfo) {
    const gradesCreditsArray = [];
    const gradesList = ['전필', '전선', '부필', '부선', '복필', '복선', '교필', '교선', '기필', '기선'];

    const sungjukMap = createSungjukMap(AtnlcScreSungjukInfo);

    const tables = document.querySelectorAll('.tablegw');

    // 기존 테이블 데이터 추출
    for (let table of tables) {
        const th = table.querySelector('thead th').textContent;
        if (th.includes("계절")) {
            continue;
        }
        const rows = table.querySelectorAll('tbody tr');

        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 6) continue;

            const subject = cells[1].textContent.trim();
            const classification = cells[3].textContent.trim();
            const credit = cells[4].textContent.trim();
            let grade = cells[5].textContent.trim();

            if (grade.includes('P') || grade === '' || grade.includes('삭제')) {
                continue;
            }
            if (!gradesList.includes(classification)) {
                continue;
            }

            if (grade == 'A+A0B+B0C+C0D+D0FNF') {
                continue;
            }

            gradesCreditsArray.push({
                subject: subject,
                classification: classification,
                credit: credit,
                grade: grade
            });
        }
    }

    // 수강 예정 과목 데이터 추출
    const plannedCoursesRows = document.querySelectorAll('#plannedCoursesTable tr');
    plannedCoursesRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;

        const subject = cells[1].querySelector('input') ? cells[1].querySelector('input').value.trim() : cells[1].textContent.trim();
        const classificationCell = cells[3];
        const creditCell = cells[4];
        const gradeCell = cells[5];

        // 드롭박스가 아닌 텍스트 상태의 데이터만 수집
        if (classificationCell.querySelector('select') || creditCell.querySelector('select') || gradeCell.querySelector('select')) {
            return;
        }

        const classification = classificationCell.textContent.trim();
        const credit = creditCell.textContent.trim();
        let grade = gradeCell.textContent.trim();

        if (grade.includes('P') || grade === '' || grade.includes('삭제')) {
            return;
        }
        if (!gradesList.includes(classification)) {
            return;
        }

        gradesCreditsArray.push({
            subject: subject,
            classification: classification,
            credit: credit,
            grade: grade
        });
    });

    const result = calculateGrades(gradesCreditsArray);

    // 결과를 HTML 요소에 업데이트
    document.getElementById('majorGPAHakjukValue').textContent = result.majorGPAHakjuk;
    document.getElementById('totalGPAHakjukValue').textContent = result.totalGPAHakjuk;
    document.getElementById('majorGPASungjuk').textContent = result.majorGPASungjuk;
    document.getElementById('totalGPASungjuk').textContent = result.totalGPASungjuk;

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
            const { classification, credit, grade } = course;
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



// 수강 내역에서 성적 바꾸기
// 1) 성적 선택 드롭박스
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

// 10. F 혹은 이번 학기 성적 선택
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
