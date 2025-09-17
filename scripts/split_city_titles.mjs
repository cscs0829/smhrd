import fs from 'fs';
import path from 'path';

const inputFile = 'export/export/city_titles.sql';
const outputDir = 'export/export/';

// 파일 읽기
console.log('City Titles SQL 파일 읽는 중...');
const content = fs.readFileSync(inputFile, 'utf8');

// INSERT 문들 찾기
const insertRegex = /INSERT INTO public\.titles \([^)]+\) VALUES \([^;]+\);?/g;
const insertStatements = content.match(insertRegex) || [];

console.log(`총 ${insertStatements.length}개의 INSERT 문을 찾았습니다.`);

// 100개씩 나누기
const chunkSize = 100;
const totalChunks = Math.ceil(insertStatements.length / chunkSize);

console.log(`${chunkSize}개씩 나누어 총 ${totalChunks}개의 파일을 생성합니다.`);

// 각 청크 파일 생성
for (let i = 0; i < totalChunks; i++) {
  const start = i * chunkSize;
  const end = Math.min(start + chunkSize, insertStatements.length);
  const chunk = insertStatements.slice(start, end);
  
  const chunkNumber = String(i + 1).padStart(3, '0');
  const outputFile = path.join(outputDir, `city_titles_part_${chunkNumber}.sql`);
  
  // 파일 내용 생성
  let fileContent = `-- City Titles Part ${chunkNumber} (${start + 1}-${end}번째 레코드)\n`;
  fileContent += `-- 총 ${chunk.length}개의 INSERT 문\n\n`;
  
  chunk.forEach((statement, index) => {
    fileContent += statement;
    if (!statement.endsWith(';')) {
      fileContent += ';';
    }
    fileContent += '\n';
  });
  
  // 파일 저장
  fs.writeFileSync(outputFile, fileContent, 'utf8');
  console.log(`생성됨: city_titles_part_${chunkNumber}.sql (${chunk.length}개 레코드)`);
}

console.log(`\n완료! 총 ${totalChunks}개의 파일이 생성되었습니다.`);
console.log(`파일 위치: ${outputDir}`);
