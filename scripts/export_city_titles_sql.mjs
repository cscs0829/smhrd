import fs from 'fs';

const inputFile = 'parsed/city_titles_data.json';
const outputFile = 'export/export/city_titles.sql';

console.log('City 제목 및 아이디 데이터를 SQL로 변환하는 중...');

try {
  // JSON 파일 읽기
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  console.log(`총 ${data.length}개의 레코드를 처리합니다.`);
  
  let sqlContent = `-- City Titles 데이터 삽입
-- 총 ${data.length}개의 레코드

`;

  // 각 레코드를 INSERT 문으로 변환
  data.forEach((row, index) => {
    const id = row.id ? `'${row.id.replace(/'/g, "''")}'` : 'NULL';
    const title = row.title ? `'${row.title.replace(/'/g, "''")}'` : 'NULL';
    const city = row.city ? `'${row.city.replace(/'/g, "''")}'` : 'NULL';
    
    sqlContent += `INSERT INTO public.titles (id, title, city) VALUES (${id}, ${title}, ${city});\n`;
  });
  
  // SQL 파일 저장
  fs.writeFileSync(outputFile, sqlContent, 'utf8');
  
  console.log(`SQL 파일이 생성되었습니다: ${outputFile}`);
  console.log(`총 ${data.length}개의 INSERT 문이 포함되었습니다.`);
  
  // 통계 출력
  const uniqueCities = [...new Set(data.map(row => row.city))].length;
  const uniqueIds = [...new Set(data.map(row => row.id))].length;
  
  console.log(`\n통계:`);
  console.log(`- 고유 도시 수: ${uniqueCities}개`);
  console.log(`- 고유 ID 수: ${uniqueIds}개`);
  console.log(`- 총 레코드 수: ${data.length}개`);
  
  // 도시별 레코드 수
  const cityCounts = {};
  data.forEach(row => {
    cityCounts[row.city] = (cityCounts[row.city] || 0) + 1;
  });
  
  console.log(`\n도시별 레코드 수 (상위 10개):`);
  Object.entries(cityCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([city, count]) => {
      console.log(`- ${city}: ${count}개`);
    });
  
} catch (error) {
  console.error('오류 발생:', error.message);
}
