/**
 * System Configuration File
 */

const CONFIG = {
    GOOGLE_SHEETS: {
        WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxlDiBMslovdzv0_tbR3MQEkigvV5V16qcJTHmBdddyzeyvtr0k3TC_6O62yOX16knB/exec', 
    },

    ORG: {
        ALLOWED_EMAIL_DOMAINS: ['mahidol.ac.th', 'mahidol.edu', 'student.mahidol.ac.th'],
        ERROR_MESSAGE: 'กรุณาใช้อีเมลมหาวิทยาลัยมหิดล (เช่น @mahidol.ac.th หรือ @student.mahidol.ac.th) เท่านั้น'
    },

    DEPARTMENTS: [
        { fullName: 'คณะแพทยศาสตร์ศิริราชพยาบาล', keywords: ['คณะแพทยศาสตร์ศิริราชพยาบาล', 'ศิริราช', 'si'], isPhysicalDept: false },
        { fullName: 'คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี', keywords: ['คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี', 'รามาธิบดี', 'รามา', 'ra', 'cd', 'nr', 'et'], isPhysicalDept: false },
        { fullName: 'คณะทันตแพทยศาสตร์', keywords: ['คณะทันตแพทยศาสตร์', 'ทันตะ', 'dt'], isPhysicalDept: false },
        { fullName: 'คณะเภสัชศาสตร์', keywords: ['คณะเภสัชศาสตร์', 'เภสัช', 'py'], isPhysicalDept: false },
        { fullName: 'คณะวิทยาศาสตร์', keywords: ['คณะวิทยาศาสตร์', 'วิทย์', 'วิทยา', 'sc'], isPhysicalDept: false },
        { fullName: 'คณะวิศวกรรมศาสตร์', keywords: ['คณะวิศวกรรมศาสตร์', 'วิศวะ', 'วิศวกรรม', 'eg'], isPhysicalDept: false },
        { fullName: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', keywords: ['คณะเทคโนโลยีสารสนเทศและการสื่อสาร', 'ไอซีที', 'ict', 'muict'], isPhysicalDept: false },
        { fullName: 'คณะเทคนิคการแพทย์', keywords: ['คณะเทคนิคการแพทย์', 'เทคนิค', 'เทคนิคการแพทย์', 'mt'], isPhysicalDept: false },
        { fullName: 'คณะกายภาพบำบัด', keywords: ['คณะกายภาพบำบัด', 'pt'], isPhysicalDept: false },
        { fullName: 'คณะพยาบาลศาสตร์', keywords: ['คณะพยาบาลศาสตร์', 'พยาบาล', 'ns'], isPhysicalDept: false },
        { fullName: 'คณะสัตวแพทยศาสตร์', keywords: ['คณะสัตวแพทยศาสตร์', 'สัตวแพทย์', 'vs'], isPhysicalDept: false },
        { fullName: 'คณะสาธารณสุขศาสตร์', keywords: ['คณะสาธารณสุขศาสตร์', 'สาธารณสุข', 'ph'], isPhysicalDept: false },
        { fullName: 'คณะสิ่งแวดล้อมและทรัพยากรศาสตร์', keywords: ['คณะสิ่งแวดล้อมและทรัพยากรศาสตร์', 'สิ่งแวดล้อม', 'en'], isPhysicalDept: false },
        { fullName: 'คณะศิลปศาสตร์', keywords: ['คณะศิลปศาสตร์', 'ศิลปศาสตร์', 'la'], isPhysicalDept: false },
        { fullName: 'คณะสังคมศาสตร์และมนุษยศาสตร์', keywords: ['คณะสังคมศาสตร์และมนุษยศาสตร์', 'สังคม', 'มนุษยศาสตร์', 'sh'], isPhysicalDept: false },
        { fullName: 'วิทยาลัยการจัดการ', keywords: ['วิทยาลัยการจัดการ', 'คณะเทคโนโลยีการจัดการ', 'mg'], isPhysicalDept: false },
        { fullName: 'บัณฑิตวิทยาลัย', keywords: ['บัณฑิตวิทยาลัย', 'gr'], isPhysicalDept: false },
        { fullName: 'สถาบันชีววิทยาศาสตร์โมเลกุล', keywords: ['สถาบันชีววิทยาศาสตร์โมเลกุล', 'mb'], isPhysicalDept: false },
        { fullName: 'สถาบันโภชนาการ', keywords: ['สถาบันโภชนาการ', 'โภชนาการ', 'nu'], isPhysicalDept: false },
        { fullName: 'สถาบันวิจัยประชากรและสังคม', keywords: ['สถาบันวิจัยประชากรและสังคม', 'ipsr'], isPhysicalDept: false },
        { fullName: 'สถาบันพัฒนาสุขภาพอาเซียน', keywords: ['สถาบันพัฒนาสุขภาพอาเซียน', 'aihd'], isPhysicalDept: false },
        { fullName: 'สถาบันนวัตกรรมการเรียนรู้', keywords: ['สถาบันนวัตกรรมการเรียนรู้', 'il'], isPhysicalDept: false },
        { fullName: 'สถาบันสิทธิมนุษยชนและสันติศึกษา', keywords: ['สถาบันสิทธิมนุษยชนและสันติศึกษา', 'ihrp'], isPhysicalDept: false },
        { fullName: 'สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย', keywords: ['สถาบันวิจัยภาษาและวัฒนธรรมเอเชีย', 'rilca'], isPhysicalDept: false },
        { fullName: 'สถาบันบริหารจัดการเทคโนโลยีและนวัตกรรม', keywords: ['สถาบันบริหารจัดการเทคโนโลยีและนวัตกรรม', 'int'], isPhysicalDept: false },
        { fullName: 'กองบริหารการศึกษา', keywords: ['กองบริหารการศึกษา', 'ea'], isPhysicalDept: false },
        { fullName: 'กองกิจการนักศึกษา', keywords: ['กองกิจการนักศึกษา', 'sa'], isPhysicalDept: false },
        { fullName: 'กองเทคโนโลยีสารสนเทศ', keywords: ['กองเทคโนโลยีสารสนเทศ', 'it', 'muit'], isPhysicalDept: false },
        { fullName: 'กองทรัพยากรบุคคล', keywords: ['กองทรัพยากรบุคคล', 'hr', 'muhr'], isPhysicalDept: false },
        { fullName: 'กองวิเทศสัมพันธ์', keywords: ['กองวิเทศสัมพันธ์', 'ir'], isPhysicalDept: false },
        { fullName: 'กองบริหารงานวิจัย', keywords: ['กองบริหารงานวิจัย', 're'], isPhysicalDept: false },
        { fullName: 'กองคลัง', keywords: ['กองคลัง', 'py', 'finance'], isPhysicalDept: false },
        { fullName: 'กองแผนงาน', keywords: ['กองแผนงาน', 'pl'], isPhysicalDept: false },
        { fullName: 'กองกายภาพและสิ่งแวดล้อม', keywords: ['กองกายภาพและสิ่งแวดล้อม', 'กองกายภาพ', 'กายภาพ', 'pe', 'สิ่งแวดล้อม'], isPhysicalDept: true },
        { fullName: 'กองกฎหมาย', keywords: ['กองกฎหมาย', 'lw'], isPhysicalDept: false },
        { fullName: 'กองพัฒนาคุณภาพ', keywords: ['กองพัฒนาคุณภาพ', 'qd'], isPhysicalDept: false },
        { fullName: 'กองบริหารงานทั่วไป', keywords: ['กองบริหารงานทั่วไป', 'ga'], isPhysicalDept: false },
        { fullName: 'ศูนย์จิตตปัญญาศึกษา', keywords: ['ศูนย์จิตตปัญญาศึกษา', 'ce'], isPhysicalDept: false },
        { fullName: 'ศูนย์สัตว์ทดลองแห่งชาติ', keywords: ['ศูนย์สัตว์ทดลองแห่งชาติ', 'nlac'], isPhysicalDept: false },
        { fullName: 'ศูนย์ส่งเสริมจริยธรรมการวิจัย', keywords: ['ศูนย์ส่งเสริมจริยธรรมการวิจัย', 'sp'], isPhysicalDept: false },
        { fullName: 'ศูนย์บริหารความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน', keywords: ['ศูนย์บริหารความปลอดภัย', 'อาชีวอนามัย', 'coshem'], isPhysicalDept: false },
        { fullName: 'ศูนย์บริหารจัดการความเสี่ยง', keywords: ['ศูนย์บริหารจัดการความเสี่ยง', 'rm'], isPhysicalDept: false },
        { fullName: 'ศูนย์บริหารสินทรัพย์', keywords: ['ศูนย์บริหารสินทรัพย์', 'map'], isPhysicalDept: false },
        { fullName: 'ศูนย์การแพทย์กาญจนาภิเษก', keywords: ['ศูนย์การแพทย์กาญจนาภิเษก', 'gj'], isPhysicalDept: false }
    ],

    COLLECT_LOCATIONS: [
        { fullName: 'อาคารศูนย์การเรียนรู้มหิดล (MLC)', keywords: ['mlc', 'ศูนย์การเรียนรู้', 'อาคารศูนย์การเรียนรู้'] },
        { fullName: 'โรงอาหารกลาง (สิริวัฒนภักดี)', keywords: ['โรงอาหารกลาง', 'สิริวัฒนภักดี', 'canteen'] },
        { fullName: 'ลานหน้าตึกอธิการบดี', keywords: ['ตึกอธิการ', 'หน้าตึกอธิการบดี', 'op'] },
        { fullName: 'อาคารสิริวิทยา', keywords: ['สิริวิทยา', 'la', 'ศิลปศาสตร์'] },
        { fullName: 'ศูนย์ประชุมมหิดลสิทธาคาร', keywords: ['สิทธาคาร', 'มหิดลสิทธาคาร', 'hall'] }
    ]
};