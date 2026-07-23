const formState = {
  recordDate: '',
  fullName: '',
  email: '',
  department: '',
  locationDetail: '', 
  activityName: '',
  wasteMetrics: {
    recycle_plastic_bottle: 0,    
    recycle_glass_can_other: 0,   
    energy_plastic: 0,
    energy_stick: 0,
    energy_spoon: 0,
    compost_plant: 0,
    compost_food: 0,
    wasteWater: 0,
    generalWaste: 0
  },
  feedback: '',
  destTreatment: '',
  destLandfill: '',
  
  getTotalWaste() {
    return Object.values(this.wasteMetrics).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wasteForm');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');
  const totalDisplay = document.getElementById('totalWasteDisplay');
  
  const pointInput = document.getElementById('pointInput');
  const deptInput = document.getElementById('departmentInput');
  const activityNameInput = document.getElementById('activityName');
  
  const successPopup = document.getElementById('successPopup');
  const closePopupBtn = document.getElementById('closePopupBtn');

  // ตั้งค่าวันที่เริ่มต้น
  const recordDateInput = document.getElementById('recordDate');
  if (recordDateInput) {
    recordDateInput.valueAsDate = new Date();
    formState.recordDate = recordDateInput.value;
  }

  // บังคับให้ช่องหมายเลขจุดเก็บ พิมพ์ได้เฉพาะเลข 0-9 และได้แค่ 1 ตัว
  // บังคับให้ช่องหมายเลขจุดเก็บ พิมพ์ได้เฉพาะตัวเลขเท่านั้น (กี่หลักก็ได้)
  if (pointInput) {
    pointInput.addEventListener('input', function(e) {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  function validateMahidolEmail(emailStr) {
    if(!emailStr.includes('@')) return false;
    const domainPart = emailStr.split('@')[1].toLowerCase();
    return CONFIG.ORG.ALLOWED_EMAIL_DOMAINS.some(domain => 
      domainPart === domain || domainPart.endsWith('.' + domain)
    );
  }

  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (value && value.includes('@') && !validateMahidolEmail(value)) {
        emailError.textContent = CONFIG.ORG.ERROR_MESSAGE;
        emailError.style.display = 'block';
      } else {
        emailError.style.display = 'none';
      }
    });
  }

  function setupAutocomplete(inputElement, dataArray, onSelectCallback) {
    if (!inputElement) return;
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
      if (elmnt != x[i] && elmnt != deptInput) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  
  document.addEventListener("click", function (e) { closeAllLists(e.target); });

  setupAutocomplete(deptInput, CONFIG.DEPARTMENTS, (selectedItem) => {
    formState.department = selectedItem.fullName;
  });

  const wasteInputs = document.querySelectorAll('.form-section input[type="number"]');
  const destWaterText = document.getElementById('destWaterText');
  const destGeneralText = document.getElementById('destGeneralText');

  wasteInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const fieldName = e.target.name;
      const val = parseFloat(e.target.value) || 0;
      
      if(formState.wasteMetrics[fieldName] !== undefined) {
          formState.wasteMetrics[fieldName] = val >= 0 ? val : 0;
      }
      if (totalDisplay) {
        totalDisplay.textContent = formState.getTotalWaste().toFixed(2);
      }

      // โชว์ข้อความปลายทางอัตโนมัติ
      if (fieldName === 'wasteWater' && destWaterText) {
        destWaterText.style.display = val > 0 ? 'block' : 'none';
      }
      if (fieldName === 'generalWaste' && destGeneralText) {
        destGeneralText.style.display = val > 0 ? 'block' : 'none';
      }
    });
  });

  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => { successPopup.style.display = 'none'; });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // เพิ่มการดักจับค่าแบบปลอดภัย (ถ้าช่องโดนลบก็ไม่ Error)
    formState.recordDate = recordDateInput ? recordDateInput.value : '';
    formState.fullName = document.getElementById('fullName') ? document.getElementById('fullName').value.trim() : '';
    formState.email = emailInput ? emailInput.value.trim() : '';
    formState.activityName = activityNameInput ? activityNameInput.value.trim() : '-';
    formState.feedback = document.getElementById('feedback') ? document.getElementById('feedback').value.trim() : '';
    formState.locationDetail = pointInput ? pointInput.value.trim() : '-'; 
    
    // ตั้งค่าปลายทางอัตโนมัติ
    formState.destTreatment = formState.wasteMetrics.wasteWater > 0 ? 'ส่งเข้าระบบบำบัด (น้ำเสีย)' : '';
    formState.destLandfill = formState.wasteMetrics.generalWaste > 0 ? 'เทศบาล (ไปหลุมฝังกลบ)' : '';

    if (deptInput) {
      let isDeptValid = CONFIG.DEPARTMENTS.some(d => d.fullName === deptInput.value);
      if (!isDeptValid) {
        alert('โปรดเลือก คณะ/หน่วยงาน จากรายการที่ระบบแนะนำเท่านั้นครับ');
        deptInput.focus();
        return;
      }
    }

    if (emailInput && !validateMahidolEmail(formState.email)) {
      alert(CONFIG.ORG.ERROR_MESSAGE);
      emailInput.focus();
      return;
    }

    let payload = {
      recordDate: formState.recordDate,
      fullName: formState.fullName,
      email: formState.email,
      department: formState.department,
      locationDetail: formState.locationDetail,
      activityName: formState.activityName,
      ...formState.wasteMetrics,
      destTreatment: formState.destTreatment,
      destLandfill: formState.destLandfill,
      totalWaste: formState.getTotalWaste(),
      feedback: formState.feedback
    };

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    try {
      if (CONFIG.GOOGLE_SHEETS.WEB_APP_URL !== 'ใส่_WEB_APP_URL_ของคุณที่นี่') {
        await fetch(CONFIG.GOOGLE_SHEETS.WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (successPopup) successPopup.style.display = 'flex';
      form.reset();
      if (recordDateInput) recordDateInput.valueAsDate = new Date();
      if (totalDisplay) totalDisplay.textContent = '0.00';
      formState.department = '';
      
      // ซ่อนข้อความปลายทางหลังจากส่งสำเร็จ
      if(destWaterText) destWaterText.style.display = 'none';
      if(destGeneralText) destGeneralText.style.display = 'none';
      
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองใหม่อีกครั้ง');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ส่งข้อมูลเข้าสู่ระบบ';
    }
  });
});