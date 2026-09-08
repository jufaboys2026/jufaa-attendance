// تحميل الطلاب
function loadStudents() {
    const classSelect = document.getElementById('classSelect');
    const classNum = classSelect.value;
    const studentsList = document.getElementById('studentsList');
    const noClassSelected = document.getElementById('noClassSelected');
    const table = document.getElementById('studentsTable');

    if (!classNum) {
        table.style.display = 'none';
        noClassSelected.style.display = 'block';
        return;
    }

    const students = studentsData[classNum];
    studentsList.innerHTML = '';

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="number">${index + 1}</td>
            <td class="student-name">${student.name}</td>
            <td><button class="status-btn present" onclick="setStatus(${index}, 'present')" title="حاضر">✅</button></td>
            <td><button class="status-btn absent" onclick="setStatus(${index}, 'absent')" title="غائب">❌</button></td>
            <td><button class="status-btn late" onclick="setStatus(${index}, 'late')" title="متأخر">⏰</button></td>
            <td><span class="status-badge" id="status-${index}">لم يتم التحديد</span></td>
        `;
        studentsList.appendChild(row);
    });

    noClassSelected.style.display = 'none';
    table.style.display = 'table';

    // تعيين التاريخ الحالي
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
}

// حفظ حالة الطالب
function setStatus(index, status) {
    const statusBadge = document.getElementById(`status-${index}`);
    const statusTexts = {
        'present': '✅ حاضر',
        'absent': '❌ غائب',
        'late': '⏰ متأخر'
    };
    const statusColors = {
        'present': '#4CAF50',
        'absent': '#f44336',
        'late': '#ff9800'
    };

    statusBadge.textContent = statusTexts[status];
    statusBadge.style.backgroundColor = statusColors[status];
    statusBadge.style.color = 'white';
    statusBadge.dataset.status = status;
}

// حفظ الحضور
function saveAttendance() {
    const classSelect = document.getElementById('classSelect');
    const periodSelect = document.getElementById('periodSelect');
    const dateInput = document.getElementById('dateInput');
    const classNum = classSelect.value;
    const period = periodSelect.value;
    const date = dateInput.value;

    if (!classNum || !date) {
        alert('⚠️ الرجاء اختيار الصف والتاريخ');
        return;
    }

    const attendance = [];
    const statusBadges = document.querySelectorAll('.status-badge');
    const students = studentsData[classNum];

    statusBadges.forEach((badge, index) => {
        const status = badge.dataset.status || 'not-marked';
        attendance.push({
            name: students[index].name,
            status: status
        });
    });

    // حفظ في LocalStorage
    const key = `attendance-${classNum}-${period}-${date}`;
    localStorage.setItem(key, JSON.stringify(attendance));

    alert('✅ تم حفظ الحضور بنجاح');
    clearAll();
}

// مسح الكل
function clearAll() {
    document.querySelectorAll('.status-badge').forEach(badge => {
        badge.textContent = 'لم يتم التحديد';
        badge.style.backgroundColor = '#ccc';
        badge.dataset.status = '';
    });
}

// طباعة الحضور
function printAttendance() {
    window.print();
}

// فتح نافذة الإحصائيات
function openStatistics() {
    const modal = document.getElementById('statisticsModal');
    const statisticsContent = document.getElementById('statisticsContent');

    let html = '<div class="statistics-grid">';

    // إحصائيات كل صف
    for (let classNum = 5; classNum <= 12; classNum++) {
        const students = studentsData[classNum];
        let presentCount = 0, absentCount = 0, lateCount = 0;

        students.forEach((student, index) => {
            // البحث عن آخر سجل حضور لهذا الطالب
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`attendance-${classNum}`)) {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data[index]) {
                        const status = data[index].status;
                        if (status === 'present') presentCount++;
                        else if (status === 'absent') absentCount++;
                        else if (status === 'late') lateCount++;
                    }
                }
            }
        });

        const total = presentCount + absentCount + lateCount;
        const attendancePercentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

        html += `
            <div class="class-stat">
                <h3>الصف ${classNum}</h3>
                <p>📚 إجمالي الطلاب: <strong>${students.length}</strong></p>
                <p>✅ حاضرين: <strong style="color: #4CAF50">${presentCount}</strong></p>
                <p>❌ غائبين: <strong style="color: #f44336">${absentCount}</strong></p>
                <p>⏰ متأخرين: <strong style="color: #ff9800">${lateCount}</strong></p>
                <p>📊 نسبة الحضور: <strong>${attendancePercentage}%</strong></p>
            </div>
        `;
    }

    html += '</div>';
    statisticsContent.innerHTML = html;
    modal.style.display = 'block';
}

// إغلاق نافذة الإحصائيات
function closeStatistics() {
    const modal = document.getElementById('statisticsModal');
    modal.style.display = 'none';
}

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('statisticsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// تحميل الصفحة
window.addEventListener('load', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').value = today;
});