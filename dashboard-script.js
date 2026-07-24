const SCRIPT_URL = CONFIG.GOOGLE_SHEETS.WEB_APP_URL;

let allData = []; 
let pieChartInstance = null; 
let barChartInstance = null;

// ==========================================
// ตั้งค่าฟอนต์มาตรฐานของกราฟทั้งหมด
// ==========================================
Chart.defaults.font.family = "'Anuphan', sans-serif";
Chart.defaults.font.size = 16; 
Chart.defaults.color = '#475569'; 

// เปิดใช้งาน Plugin ตัวเลขบนกราฟ
Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', () => {
  fetchDataAndRender();
  document.getElementById('filter-year').addEventListener('change', applyFilters);
  document.getElementById('filter-dept').addEventListener('change', applyFilters);
  document.getElementById('filter-point').addEventListener('change', applyFilters); 
});

async function fetchDataAndRender() {
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();

    allData = data.slice(1); 

    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';

    populateFilters();
    applyFilters();
    
  } catch (error) {
    document.getElementById('loading').textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูล หรือยังไม่ได้อัปเดตสคริปต์ (Deploy)';
    console.error('Error:', error);
  }
}

function populateFilters() {
  const yearSet = new Set();
  const deptSet = new Set();
  const pointSet = new Set(); 

  allData.forEach(row => {
    const dateStr = row[1];
    if (dateStr) {
      const year = new Date(dateStr).getFullYear();
      if (!isNaN(year)) yearSet.add(year);
    }
    const dept = row[4];
    if (dept) deptSet.add(dept);
    
    // ดึงค่าหมายเลขกลุ่ม (คอลัมน์ F)
    const point = row[5]; 
    if (point) pointSet.add(point);
  });

  const yearSelect = document.getElementById('filter-year');
  [...yearSet].sort().reverse().forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">ปี ${year}</option>`;
  });

  const deptSelect = document.getElementById('filter-dept');
  [...deptSet].sort().forEach(dept => {
    deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
  });

  const pointSelect = document.getElementById('filter-point');
  [...pointSet].sort((a, b) => Number(a) - Number(b)).forEach(point => {
    pointSelect.innerHTML += `<option value="${point}">กลุ่มที่ ${point}</option>`;
  });
}

function applyFilters() {
  const yearFilter = document.getElementById('filter-year').value;
  const deptFilter = document.getElementById('filter-dept').value;
  const pointFilter = document.getElementById('filter-point').value; 

  const filteredData = allData.filter(row => {
    const dateStr = row[1];
    const rowYear = dateStr ? new Date(dateStr).getFullYear().toString() : '';
    const rowDept = row[4];
    const rowPoint = row[5] ? row[5].toString().trim() : ''; 

    const matchYear = (yearFilter === 'all') || (rowYear === yearFilter);
    const matchDept = (deptFilter === 'all') || (rowDept === deptFilter);
    const matchPoint = (pointFilter === 'all') || (rowPoint === pointFilter); 

    return matchYear && matchDept && matchPoint;
  });

  processData(filteredData);
}

function processData(data) {
  let totals = { food: 0, water: 0, recycle: 0, energy: 0, general: 0, plant: 0 };

  data.forEach(row => {
    totals.recycle += (parseFloat(row[6]) || 0) + (parseFloat(row[7]) || 0);
    totals.energy += (parseFloat(row[8]) || 0) + (parseFloat(row[9]) || 0) + (parseFloat(row[10]) || 0);
    totals.plant += (parseFloat(row[11]) || 0);
    totals.food += (parseFloat(row[12]) || 0);
    totals.water += (parseFloat(row[13]) || 0);
    totals.general += (parseFloat(row[15]) || 0);
  });

  let totalWaste = totals.food + totals.water + totals.recycle + totals.energy + totals.general + totals.plant;

  const categories = [
    { name: 'ขยะเศษอาหาร', val: totals.food, color: '#4A90E2' },
    { name: 'น้ำเสีย', val: totals.water, color: '#F5A623' },
    { name: 'ขยะรีไซเคิล', val: totals.recycle, color: '#7ED321' },
    { name: 'ขยะพลังงาน (RDF)', val: totals.energy, color: '#9013FE' },
    { name: 'ขยะทั่วไป (ฝังกลบ)', val: totals.general, color: '#50E3C2' },
    { name: 'ขยะเยื่อพืช (ทำปุ๋ย)', val: totals.plant, color: '#D0021B' }
  ];

  renderSummaryCards(totals, totalWaste);
  renderPieChart(categories);
  renderBarChart(categories);
  
  // เรียกวาดตารางสรุปรายวัน
  renderDailyTable(data);
}

function renderSummaryCards(totals, totalWaste) {
  let diverted = totals.food + totals.water + totals.recycle + totals.energy + totals.plant;
  let landfill = totals.general;

  let divPercent = totalWaste > 0 ? ((diverted / totalWaste) * 100).toFixed(2) : '0.00';
  let landPercent = totalWaste > 0 ? ((landfill / totalWaste) * 100).toFixed(2) : '0.00';

  document.getElementById('totalWasteText').innerHTML = `${totalWaste.toFixed(2)} <span class="unit">กก.</span>`;
  document.getElementById('divertedText').innerHTML = `${diverted.toFixed(2)} <span class="unit">กก.</span>`;
  document.getElementById('divertedPercent').textContent = `${divPercent}%`;
  document.getElementById('landfillText').innerHTML = `${landfill.toFixed(2)} <span class="unit">กก.</span>`;
  document.getElementById('landfillPercent').textContent = `${landPercent}%`;
}

function renderPieChart(categories) {
  if (pieChartInstance) { pieChartInstance.destroy(); }
  const ctx = document.getElementById('wastePieChart').getContext('2d');
  
  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.val),
        backgroundColor: categories.map(c => c.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { padding: 24 }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 14,
            family: "'Anuphan', sans-serif"
          },
          formatter: (value, ctx) => {
            let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            if (value === 0 || sum === 0) return null;
            let percentage = (value * 100 / sum).toFixed(1) + '%';
            return percentage;
          }
        }
      }
    }
  });
}

function renderBarChart(categories) {
  if (barChartInstance) { barChartInstance.destroy(); }
  const ctx = document.getElementById('wasteBarChart').getContext('2d');
  
  let sortedData = [...categories].sort((a, b) => b.val - a.val);

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedData.map(c => c.name),
      datasets: [{
        label: 'ปริมาณ (กก.)',
        data: sortedData.map(c => c.val),
        backgroundColor: sortedData.map(c => c.color),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        datalabels: { display: false }
      },
      scales: {
        x: { grid: { color: '#e2e8f0' } },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderDailyTable(data) {
  const card = document.getElementById('daily-summary-card');
  const tbody = document.getElementById('dailyTableBody');
  const tfoot = document.getElementById('dailyTableFoot');
  const dayCountBadge = document.getElementById('dayCountBadge');

  if (!card || !tbody || !tfoot) return;

  if (!data || data.length === 0) {
    card.style.display = 'none';
    return;
  }
  
  card.style.display = 'block';

  const dailyMap = {};

  data.forEach(row => {
    let rawDate = row[1];
    let dateKey = 'ไม่ระบุวันที่';

    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dateKey = d.toISOString().split('T')[0];
      } else {
        dateKey = String(rawDate).split('T')[0];
      }
    }

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { food: 0, water: 0, recycle: 0, energy: 0, plant: 0, general: 0, total: 0 };
    }

    let recycle = (parseFloat(row[6]) || 0) + (parseFloat(row[7]) || 0);
    let energy = (parseFloat(row[8]) || 0) + (parseFloat(row[9]) || 0) + (parseFloat(row[10]) || 0);
    let plant = parseFloat(row[11]) || 0;
    let food = parseFloat(row[12]) || 0;
    let water = parseFloat(row[13]) || 0;
    let general = parseFloat(row[15]) || 0;
    let sumRow = recycle + energy + plant + food + water + general;

    dailyMap[dateKey].recycle += recycle;
    dailyMap[dateKey].energy += energy;
    dailyMap[dateKey].plant += plant;
    dailyMap[dateKey].food += food;
    dailyMap[dateKey].water += water;
    dailyMap[dateKey].general += general;
    dailyMap[dateKey].total += sumRow;
  });

  const sortedDates = Object.keys(dailyMap).sort();

  if (dayCountBadge) {
    dayCountBadge.textContent = `มีข้อมูลทั้งหมด ${sortedDates.length} วัน`;
  }

  let tbodyHTML = '';
  let totals = { food: 0, water: 0, recycle: 0, energy: 0, plant: 0, general: 0, total: 0 };

  sortedDates.forEach(dateStr => {
    const item = dailyMap[dateStr];

    let formattedDate = dateStr;
    if (dateStr !== 'ไม่ระบุวันที่') {
      const dObj = new Date(dateStr);
      if (!isNaN(dObj.getTime())) {
        formattedDate = dObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }

    tbodyHTML += `
      <tr>
        <td style="text-align:left;">${formattedDate}</td>
        <td>${item.food.toFixed(2)}</td>
        <td>${item.water.toFixed(2)}</td>
        <td>${item.recycle.toFixed(2)}</td>
        <td>${item.energy.toFixed(2)}</td>
        <td>${item.plant.toFixed(2)}</td>
        <td>${item.general.toFixed(2)}</td>
        <td style="color:#1a5f7a;"><strong>${item.total.toFixed(2)}</strong></td>
      </tr>
    `;

    totals.food += item.food;
    totals.water += item.water;
    totals.recycle += item.recycle;
    totals.energy += item.energy;
    totals.plant += item.plant;
    totals.general += item.general;
    totals.total += item.total;
  });

  tbody.innerHTML = tbodyHTML;

  tfoot.innerHTML = `
    <tr>
      <td style="text-align:left;"><strong>สรุปยอดรวม</strong></td>
      <td>${totals.food.toFixed(2)}</td>
      <td>${totals.water.toFixed(2)}</td>
      <td>${totals.recycle.toFixed(2)}</td>
      <td>${totals.energy.toFixed(2)}</td>
      <td>${totals.plant.toFixed(2)}</td>
      <td>${totals.general.toFixed(2)}</td>
      <td style="color:#1a5f7a; font-size:1.1em;"><strong>${totals.total.toFixed(2)}</strong></td>
    </tr>
  `;
}