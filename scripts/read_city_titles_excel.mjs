import XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'city별 제목 및 아이디.xlsx';

console.log('City 제목 및 아이디 엑셀 파일 읽는 중...');

try {
  // 엑셀 파일 읽기
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // JSON으로 변환
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`시트명: ${sheetName}`);
  console.log(`총 ${jsonData.length}개의 행을 찾았습니다.`);
  
  if (jsonData.length > 0) {
    console.log('\n첫 번째 행 (헤더):');
    console.log(JSON.stringify(jsonData[0], null, 2));
    
    console.log('\n첫 10개 행:');
    jsonData.slice(0, 10).forEach((row, index) => {
      console.log(`\n--- 행 ${index + 1} ---`);
      console.log(JSON.stringify(row, null, 2));
    });
    
    // 컬럼명 분석
    const columns = Object.keys(jsonData[0]);
    console.log(`\n컬럼명들: ${columns.join(', ')}`);
  }
  
  // JSON 파일로 저장
  const outputFile = 'parsed/city_titles_data.json';
  fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`\n데이터가 ${outputFile}에 저장되었습니다.`);
  
} catch (error) {
  console.error('파일 읽기 오류:', error.message);
}
