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
  
  // เพิ่มบรรทัดนี้ เพื่อให้ระบบกรองข้อมูลทันทีที่เปลี่ยนจุดเก็บ
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
  const pointSet = new Set(); // เพิ่ม Set สำหรับเก็บหมายเลขจุดที่ไม่ซ้ำ

  allData.forEach(row => {
    const dateStr = row[1];
    if (dateStr) {
      const year = new Date(dateStr).getFullYear();
      if (!isNaN(year)) yearSet.add(year);
    }
    const dept = row[4];
    if (dept) deptSet.add(dept);
    
    // ดึงค่าหมายเลขจุดเก็บ (สมมติว่าอยู่ในคอลัมน์ F หรือ index 5 ของ Sheet)
    // หากในชีทของคุณ หมายเลขจุดเก็บอยู่คอลัมน์อื่น ให้เปลี่ยนเลข 5 เป็นเลขอื่น (A=0, B=1, C=2, ...)
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

  // เพิ่มตัวเลือกกลุ่มเข้าไปใน Dropdown
  const pointSelect = document.getElementById('filter-point');
  [...pointSet].sort((a, b) => Number(a) - Number(b)).forEach(point => {
    pointSelect.innerHTML += `<option value="${point}">กลุ่มที่ ${point}</option>`;
  });
}

function applyFilters() {
  const yearFilter = document.getElementById('filter-year').value;
  const deptFilter = document.getElementById('filter-dept').value;
  const pointFilter = document.getElementById('filter-point').value; // ดึงค่าจาก Dropdown ใหม่

  const filteredData = allData.filter(row => {
    const dateStr = row[1];
    const rowYear = dateStr ? new Date(dateStr).getFullYear().toString() : '';
    const rowDept = row[4];
    
    // ดึงค่าหมายเลขจุดเก็บจากแถวข้อมูล (ต้องตรงกับ index ในฟังก์ชันด้านบน)
    const rowPoint = row[5] ? row[5].toString().trim() : ''; 

    const matchYear = (yearFilter === 'all') || (rowYear === yearFilter);
    const matchDept = (deptFilter === 'all') || (rowDept === deptFilter);
    const matchPoint = (pointFilter === 'all') || (rowPoint === pointFilter); // ตรวจสอบเงื่อนไขจุดเก็บ

    // ข้อมูลต้องตรงกับทุกเงื่อนไข (ปี, คณะ, จุดเก็บ)
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
        // ตั้งค่าตัวเลขเปอร์เซ็นต์ในกราฟวงกลม
        datalabels: {
          color: '#ffffff', // สีตัวเลขสีขาว
          font: {
            weight: 'bold',
            size: 14,
            family: "'Anuphan', sans-serif"
          },
          formatter: (value, ctx) => {
            // คำนวณหาผลรวมทั้งหมด
            let sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            if (value === 0 || sum === 0) return null; // ถ้าเป็น 0 ไม่ต้องแสดงข้อความ
            
            let percentage = (value * 100 / sum).toFixed(1) + '%'; // ทศนิยม 1 ตำแหน่ง เช่น 15.2%
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
        // ปิดตัวเลขบนกราฟแท่งเพื่อไม่ให้ดูรกเกินไป
        datalabels: { display: false }
      },
      scales: {
        x: { grid: { color: '#e2e8f0' } },
        y: { grid: { display: false } }
      }
    }
  });
}