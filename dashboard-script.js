// ====== ดึง URL Google Apps Script จากไฟล์ config.js ======
const SCRIPT_URL = CONFIG.GOOGLE_SHEETS.WEB_APP_URL;

let allData = []; // เก็บข้อมูลทั้งหมดไว้สำหรับ Filter (Ignoring header row)
let chartInstances = {}; // เก็บกราฟไว้เพื่อลบและวาดใหม่เวลากดเปลี่ยน Filter

document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndRender();

  // ตั้งค่าให้เมื่อกดเปลี่ยนตัวกรอง ให้วาดกราฟใหม่
  document.getElementById('filter-year').addEventListener('change', applyFilters);
  document.getElementById('filter-dept').addEventListener('change', applyFilters);
  document.getElementById('filter-activity').addEventListener('change', applyFilters);
});

async function fetchDataAndRender() {
  try {
    const response = await fetch(SCRIPT_URL);
    // Data is now [[HeaderRow], [DataRow1], [DataRow2]]
    const data = await response.json();

    // บันทึกข้อมูลทั้งหมด โดยตัดแถวหัวข้อออก (Ignore header row)
    allData = data.slice(1);

    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';

    populateFilters(); // สร้างตัวเลือกในปุ่ม
    applyFilters();    // วาดกราฟครั้งแรก

  } catch (error) {
    document.getElementById('loading').textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูล หรือยังไม่ได้อัปเดตสคริปต์ (Deploy)';
    console.error('Error fetching data:', error);
  }
}

// =====================================
// 1. ระบบจัดการตัวกรอง (Filters) - Using Indices
// =====================================
function populateFilters() {
  const yearSet = new Set();
  const deptSet = new Set();
  const actSet = new Set();

  allData.forEach(row => {
    // หาปี (คอลัมน์ B - Index 1)
    const dateStr = row[1]; // Column B: วันที่จัดเก็บข้อมูล
    if (dateStr) {
      const year = new Date(dateStr).getFullYear();
      if (!isNaN(year)) yearSet.add(year);
    }
    // หาคณะ (คอลัมน์ E - Index 4)
    const dept = row[4]; // Column E: คณะ/ส่วนงาน
    if (dept) deptSet.add(dept);
    // หากิจกรรม (คอลัมน์ H - Index 7)
    const act = row[7]; // Column H: ชื่อกิจกรรมที่จัดเก็บ
    if (act) actSet.add(act);
  });

  // ใส่ตัวเลือกลงใน Dropdown
  const yearSelect = document.getElementById('filter-year');
  [...yearSet].sort().reverse().forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">📅 ปี ${year}</option>`;
  });

  const deptSelect = document.getElementById('filter-dept');
  [...deptSet].sort().forEach(dept => {
    deptSelect.innerHTML += `<option value="${dept}">🏢 ${dept}</option>`;
  });

  const actSelect = document.getElementById('filter-activity');
  [...actSet].sort().forEach(act => {
    actSelect.innerHTML += `<option value="${act}">🎯 ${act}</option>`;
  });
}

function applyFilters() {
  const yearFilter = document.getElementById('filter-year').value;
  const deptFilter = document.getElementById('filter-dept').value;
  const actFilter = document.getElementById('filter-activity').value;

  // กรองข้อมูลตามที่เลือก (Using Indices)
  const filteredData = allData.filter(row => {
    // Column B (1), Column E (4), Column H (7)
    const dateStr = row[1]; // B: วันที่จัดเก็บข้อมูล
    const rowYear = dateStr ? new Date(dateStr).getFullYear().toString() : '';
    const rowDept = row[4]; // E: คณะ/ส่วนงาน
    const rowAct = row[7]; // H: ชื่อกิจกรรมที่จัดเก็บ

    const matchYear = (yearFilter === 'all') || (rowYear === yearFilter);
    const matchDept = (deptFilter === 'all') || (rowDept === deptFilter);
    const matchAct = (actFilter === 'all') || (rowAct === actFilter);

    return matchYear && matchDept && matchAct;
  });

  processData(filteredData);
}

// =====================================
// 2. คำนวณและวาดกราฟ
// =====================================
function processData(data) {
  let totals = {
    'ขยะเศษอาหาร': 0, 'น้ำเสีย': 0, 'ขยะรีไซเคิล': 0,
    'ขยะพลังงาน': 0, 'ขยะทั่วไป (ฝังกลบ)': 0, 'ขยะเยื่อพืช (ทำปุ๋ย)': 0
  };
  let departmentTotals = {};
  let activityTotals = {};

  data.forEach(row => {
    // คอลัมน์ J, K, L, M, N, O
    // Index 9, 10, 11, 12, 13, 14
    totals['ขยะเศษอาหาร'] += parseFloat(row[9]) || 0;
    totals['น้ำเสีย'] += parseFloat(row[10]) || 0;
    totals['ขยะรีไซเคิล'] += parseFloat(row[11]) || 0;
    totals['ขยะพลังงาน'] += parseFloat(row[12]) || 0;
    totals['ขยะทั่วไป (ฝังกลบ)'] += parseFloat(row[13]) || 0;
    totals['ขยะเยื่อพืช (ทำปุ๋ย)'] += parseFloat(row[14]) || 0;

    // คอลัมน์ P - Index 15
    const totalRowWaste = parseFloat(row[15]) || 0;

    // คอลัมน์ E - Index 4
    const dept = row[4] || 'ไม่ระบุ'; // Column E: คณะ/ส่วนงาน
    if (!departmentTotals[dept]) departmentTotals[dept] = 0;
    departmentTotals[dept] += totalRowWaste;

    // คอลัมน์ H - Index 7
    const act = row[7] || 'ไม่ระบุ'; // Column H: ชื่อกิจกรรมที่จัดเก็บ
    if (!activityTotals[act]) activityTotals[act] = 0;
    activityTotals[act] += totalRowWaste;
  });

  // อัปเดตไฮไลท์
  let maxWasteType = ''; let maxWasteValue = -1;
  for (const [key, value] of Object.entries(totals)) {
    if (value > maxWasteValue) { maxWasteValue = value; maxWasteType = key; }
  }
  document.getElementById('top-waste-type').textContent = maxWasteType || '-';
  document.getElementById('top-waste-type-amount').textContent = maxWasteValue > 0 ? maxWasteValue.toFixed(2) + ' กก.' : '0 กก.';

  let maxDept = ''; let maxDeptValue = -1;
  for (const [key, value] of Object.entries(departmentTotals)) {
    if (value > maxDeptValue && key !== 'ไม่ระบุ') { maxDeptValue = value; maxDept = key; }
  }
  document.getElementById('top-department').textContent = maxDept || '-';
  document.getElementById('top-department-amount').textContent = maxDeptValue > 0 ? maxDeptValue.toFixed(2) + ' กก.' : '0 กก.';

  // วาดกราฟ
  renderWasteTypeChart(totals);
  renderTopChart('activityChart', activityTotals, 'กิจกรรม (กก.)', '#feca57');
  renderTopChart('departmentChart', departmentTotals, 'หน่วยงาน (กก.)', '#1dd1a1');
}

// ระบบทำลายกราฟเก่าก่อนวาดใหม่ (ป้องกันกราฟซ้อนกัน)
function renderChart(chartId, config) {
  if (chartInstances[chartId]) { chartInstances[chartId].destroy(); }
  const ctx = document.getElementById(chartId).getContext('2d');
  chartInstances[chartId] = new Chart(ctx, config);
}

function renderWasteTypeChart(totals) {
  renderChart('wasteTypeChart', {
    type: 'doughnut',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: ['#ff9f43', '#0abde3', '#1dd1a1', '#feca57', '#576574', '#10ac84']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function renderTopChart(canvasId, dataObj, labelStr, barColor) {
  const sortedData = Object.entries(dataObj).filter(([k, v]) => k !== 'ไม่ระบุ' && v > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  renderChart(canvasId, {
    type: 'bar',
    data: {
      labels: sortedData.map(i => i[0]),
      datasets: [{ label: labelStr, data: sortedData.map(i => i[1]), backgroundColor: barColor, borderRadius: 4 }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}