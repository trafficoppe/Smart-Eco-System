/**
 * Single Source of Truth (SSOT) State Management
 */
const formState = {
  recordDate: '',
  fullName: '',
  email: '',
  department: '',
  groupName: '', 
  isPhysicalDept: false,
  locationDetail: '', 
  activityName: '',
  collectLocation: '',
  wasteMetrics: {
    foodWaste: 0,
    wasteWater: 0,
    recycleWaste: 0,
    energyWaste: 0,
    generalWaste: 0,
    compostWaste: 0
  },
  feedback: '',
  
  getTotalWaste() {
    return Object.values(this.wasteMetrics).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wasteForm');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const totalDisplay = document.getElementById('totalWasteDisplay');
  
  const dynamicSection = document.getElementById('dynamicSection');
  const pointInput = document.getElementById('pointInput');
  const deptInput = document.getElementById('departmentInput');
  const groupNameInput = document.getElementById('groupName');
  
  const physicalPointContainer = document.getElementById('physicalPointContainer');
  const groupNameContainer = document.getElementById('groupNameContainer');
  
  const activityNameInput = document.getElementById('activityName');
  const collectLocationInput = document.getElementById('collectLocation');
  const collectLocationContainer = document.getElementById('collectLocationContainer');
  
  const titleSectionWaste = document.getElementById('titleSectionWaste');
  const titleSectionFeedback = document.getElementById('titleSectionFeedback');
  
  const successPopup = document.getElementById('successPopup');
  const closePopupBtn = document.getElementById('closePopupBtn');

  // ตั้งค่าวันที่เริ่มต้น
  const recordDateInput = document.getElementById('recordDate');
  recordDateInput.valueAsDate = new Date();
  formState.recordDate = recordDateInput.value;

  // ==========================================
  // ระบบเสียงพูด (Audio System)
  // ==========================================
  const audios = {
    date: new Audio('sounds/date.wav'),
    name: new Audio('sounds/name.wav'),
    email: new Audio('sounds/Email.wav'),
    dept: new Audio('sounds/dept.wav'),
    group: new Audio('sounds/group.wav'),
    point: new Audio('sounds/point.wav'), 
    location: new Audio('sounds/location.wav'),
    activity_name: new Audio('sounds/activity_name.wav'),
    collect_loc: new Audio('sounds/collect_loc.wav'),
    food: new Audio('sounds/food.wav'),
    water: new Audio('sounds/water.wav'),
    recycle: new Audio('sounds/recycle.wav'),
    energy: new Audio('sounds/energy.wav'),
    general: new Audio('sounds/general.wav'),
    compost: new Audio('sounds/compost.wav'),
    feedback: new Audio('sounds/feedback.wav'),
    submit: new Audio('sounds/submit.wav')
  };

  let currentAudio = null; 
  const playedAudios = new Set(); 

  function playSound(audioKey, audioObject) {
    if (playedAudios.has(audioKey)) return;
    if (currentAudio && currentAudio !== audioObject) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = audioObject;
    audioObject.currentTime = 0;
    audioObject.play().catch(e => console.log('รอผู้ใช้คลิกหน้าเว็บก่อนเล่นเสียง:', e));
    playedAudios.add(audioKey);
  }

  recordDateInput.addEventListener('focus', () => playSound('date', audios.date));
  document.getElementById('fullName').addEventListener('focus', () => playSound('name', audios.name));
  emailInput.addEventListener('focus', () => playSound('email', audios.email));
  deptInput.addEventListener('focus', () => playSound('dept', audios.dept));
  groupNameInput.addEventListener('focus', () => playSound('group', audios.group));
  pointInput.addEventListener('focus', () => playSound('point', audios.point));
  activityNameInput.addEventListener('focus', () => playSound('activity_name', audios.activity_name));
  collectLocationInput.addEventListener('focus', () => playSound('collect_loc', audios.collect_loc));
  
  document.querySelector('input[name="foodWaste"]').addEventListener('focus', () => playSound('food', audios.food));
  document.querySelector('input[name="wasteWater"]').addEventListener('focus', () => playSound('water', audios.water));
  document.querySelector('input[name="recycleWaste"]').addEventListener('focus', () => playSound('recycle', audios.recycle));
  document.querySelector('input[name="energyWaste"]').addEventListener('focus', () => playSound('energy', audios.energy));
  document.querySelector('input[name="generalWaste"]').addEventListener('focus', () => playSound('general', audios.general));
  document.querySelector('input[name="compostWaste"]').addEventListener('focus', () => playSound('compost', audios.compost));
  
  document.getElementById('feedback').addEventListener('focus', () => playSound('feedback', audios.feedback));

  // ==========================================
  // ระบบตรวจสอบ Email 
  // ==========================================
  function validateMahidolEmail(emailStr) {
    if(!emailStr.includes('@')) return false;
    const domainPart = emailStr.split('@')[1].toLowerCase();
    return CONFIG.ORG.ALLOWED_EMAIL_DOMAINS.some(domain => 
      domainPart === domain || domainPart.endsWith('.' + domain)
    );
  }

  emailInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value && value.includes('@') && !validateMahidolEmail(value)) {
      emailError.textContent = CONFIG.ORG.ERROR_MESSAGE;
      emailError.style.display = 'block';
    } else {
      emailError.style.display = 'none';
    }
  });


  // ==========================================
  // ระบบ Smart Autocomplete 
  // ==========================================
  function setupAutocomplete(inputElement, dataArray, onSelectCallback) {
    inputElement.addEventListener('input', function(e) {
      let a, b, val = this.value;
      closeAllLists();
      if (!val) { return false; }
      
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);

      const searchLower = val.toLowerCase();
      
      dataArray.forEach(item => {
        const match = item.keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
        
        if (match) {
          b = document.createElement("DIV");
          let matchIndex = item.fullName.toLowerCase().indexOf(searchLower);
          
          if(matchIndex !== -1) {
              b.innerHTML = item.fullName.substring(0, matchIndex);
              b.innerHTML += "<strong>" + item.fullName.substring(matchIndex, matchIndex + searchLower.length) + "</strong>";
              b.innerHTML += item.fullName.substring(matchIndex + searchLower.length);
          } else {
              b.innerHTML = item.fullName;
          }

          b.innerHTML += "<input type='hidden' value='" + item.fullName + "'>";
          
          b.addEventListener("click", function(e) {
            inputElement.value = this.getElementsByTagName("input")[0].value;
            if(onSelectCallback) onSelectCallback(item);
            closeAllLists();
          });
          a.appendChild(b);
        }
      });
    });
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != deptInput && elmnt != collectLocationInput) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  
  document.addEventListener("click", function (e) { closeAllLists(e.target); });

  setupAutocomplete(deptInput, CONFIG.DEPARTMENTS, (selectedItem) => {
    formState.department = selectedItem.fullName;
    formState.isPhysicalDept = selectedItem.isPhysicalDept;
    updateDynamicForm();
  });

  const allCollectLocations = CONFIG.DEPARTMENTS.concat(CONFIG.COLLECT_LOCATIONS || []);
  setupAutocomplete(collectLocationInput, allCollectLocations, (selectedItem) => {
    formState.collectLocation = selectedItem.fullName;
  });


  // ==========================================
  // ระบบ Dynamic สลับหน้าฟอร์ม และตัวเลข Section
  // ==========================================
  function updateDynamicForm() {
    // 1. ถ้าเป็นกองกายภาพและสิ่งแวดล้อม
    if (formState.isPhysicalDept) {
      
      // ส่วนที่ 1: ซ่อนช่องชื่อกลุ่ม
      groupNameContainer.style.display = 'none';
      groupNameInput.value = '';
      
      // แสดงส่วนที่ 2 (จุดเก็บ)
      dynamicSection.style.display = 'block';
      pointInput.required = true;
      
      // ปรับลำดับเป็น 1 -> 2 -> 3 -> 4
      titleSectionWaste.textContent = 'ส่วนที่ 3: ปริมาณขยะและของเสีย (กิโลกรัม)';
      titleSectionFeedback.textContent = 'ส่วนที่ 4: ข้อเสนอแนะ / แจ้งปัญหา';
      
      // ซ่อนช่องสถานที่รวบรวม
      collectLocationContainer.style.display = 'none';
      collectLocationInput.value = '';
      
    } 
    // 2. ถ้าเป็นคณะ/ส่วนงานอื่น
    else {
      
      // ส่วนที่ 1: แสดงช่องชื่อกลุ่ม
      if (formState.department !== '') {
         groupNameContainer.style.display = 'flex';
      }
      
      // ซ่อนส่วนที่ 2 เดิม (จุดเก็บ) ไปเลย
      dynamicSection.style.display = 'none';
      pointInput.required = false;
      pointInput.value = ''; 
      
      // ปรับลำดับเป็น 1 -> 2 -> 3
      titleSectionWaste.textContent = 'ส่วนที่ 2: ปริมาณขยะและของเสีย (กิโลกรัม)';
      titleSectionFeedback.textContent = 'ส่วนที่ 3: ข้อเสนอแนะ / แจ้งปัญหา';
      
      // แสดงสถานที่รวบรวม
      collectLocationContainer.style.display = 'flex';
    }
  }

  // เรียกใช้งานค่าเริ่มต้น
  updateDynamicForm();


  // ==========================================
  // ซิงก์ข้อมูลน้ำหนักขยะ และคำนวณยอดรวม
  // ==========================================
  const wasteInputs = document.querySelectorAll('.grid-2 input[type="number"]');
  wasteInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const fieldName = e.target.name;
      const val = parseFloat(e.target.value) || 0;
      formState.wasteMetrics[fieldName] = val >= 0 ? val : 0;
      totalDisplay.textContent = formState.getTotalWaste().toFixed(2);
    });
  });

  // ==========================================
  // จัดการปิด Popup เมื่อกด "ตกลง"
  // ==========================================
  closePopupBtn.addEventListener('click', () => {
    successPopup.style.display = 'none';
  });


  // ==========================================
  // จัดการ Submit ฟอร์มส่งเข้าระบบ
  // ==========================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formState.recordDate = document.getElementById('recordDate').value;
    formState.fullName = document.getElementById('fullName').value.trim();
    formState.email = document.getElementById('email').value.trim();
    formState.groupName = groupNameInput.value.trim();
    formState.activityName = activityNameInput.value.trim();
    formState.collectLocation = collectLocationInput.value.trim();
    formState.feedback = document.getElementById('feedback').value.trim();
    
    if(formState.isPhysicalDept) {
        formState.locationDetail = pointInput.value.trim();
        formState.groupName = '-'; // บังคับใส่ขีดกรณีเป็นกองกายภาพเพื่อไม่ให้ช่องว่าง
        if (!formState.locationDetail) {
          alert('โปรดระบุหมายเลขจุดเก็บ หรือชื่อจุดย่อย ให้ครบถ้วนครับ');
          pointInput.focus();
          return;
        }
    } else {
        formState.locationDetail = '-';
    }

    let isDeptValid = CONFIG.DEPARTMENTS.some(d => d.fullName === deptInput.value);
    if (!isDeptValid) {
      alert('โปรดเลือก คณะ/หน่วยงาน จากรายการที่ระบบแนะนำเท่านั้นครับ');
      deptInput.focus();
      return;
    }

    if (!validateMahidolEmail(formState.email)) {
      alert(CONFIG.ORG.ERROR_MESSAGE);
      emailInput.focus();
      return;
    }

    let payload = {
      recordDate: formState.recordDate,
      fullName: formState.fullName,
      email: formState.email,
      department: formState.department,
      groupName: formState.groupName,
      locationDetail: formState.locationDetail,
      activityName: formState.activityName,
      collectLocation: formState.collectLocation,
      ...formState.wasteMetrics,
      totalWaste: formState.getTotalWaste(),
      feedback: formState.feedback
    };

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    try {
      if (CONFIG.GOOGLE_SHEETS.WEB_APP_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        await fetch(CONFIG.GOOGLE_SHEETS.WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      successPopup.style.display = 'flex';
      playedAudios.clear();
      playSound('submit', audios.submit);
      
      form.reset();
      recordDateInput.valueAsDate = new Date();
      totalDisplay.textContent = '0.00';
      formState.department = '';
      
      updateDynamicForm(); 
      
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองใหม่อีกครั้ง');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ส่งข้อมูลเข้าสู่ระบบ';
    }
  });
});