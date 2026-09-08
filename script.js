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

    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
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

        totalStudents += students.length;
        totalPresent += presentCount;
        totalAbsent += absentCount;
        totalLate += lateCount;

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

    // إضافة الإحصائية العامة للمدرسة
    const totalRecorded = totalPresent + totalAbsent + totalLate;
    const overallPercentage = totalRecorded > 0 ? ((totalPresent / totalRecorded) * 100).toFixed(1) : 0;

    let generalStatsHtml = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; text-align: center;">
            <h2 style="margin-bottom: 20px; font-size: 24px;">📊 الإحصائية العامة للمدرسة</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">📚 إجمالي الطلاب</p>
                    <p style="font-size: 28px; font-weight: bold;">${totalStudents}</p>
                </div>
                <div style="background: rgba(76, 175, 80, 0.3); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">✅ الحاضرين</p>
                    <p style="font-size: 28px; font-weight: bold;">${totalPresent}</p>
                </div>
                <div style="background: rgba(244, 67, 54, 0.3); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">❌ الغائبين</p>
                    <p style="font-size: 28px; font-weight: bold;">${totalAbsent}</p>
                </div>
                <div style="background: rgba(255, 152, 0, 0.3); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">⏰ المتأخرين</p>
                    <p style="font-size: 28px; font-weight: bold;">${totalLate}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">📈 عدد السجلات</p>
                    <p style="font-size: 28px; font-weight: bold;">${totalRecorded}</p>
                </div>
                <div style="background: rgba(255, 255, 255, 0.2); padding: 15px; border-radius: 8px;">
                    <p style="font-size: 14px; opacity: 0.9;">📊 نسبة الحضور العامة</p>
                    <p style="font-size: 28px; font-weight: bold;">${overallPercentage}%</p>
                </div>
            </div>
        </div>
    `;

    statisticsContent.innerHTML = generalStatsHtml + `
        <h3 style="margin: 30px 0 20px 0; text-align: center;">📋 تفاصيل الصفوف</h3>
    ` + html;
    
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
