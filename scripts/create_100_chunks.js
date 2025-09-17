const fs = require('fs');
const path = require('path');

// ep_data.sql 파일 읽기
const sqlFilePath = path.join(__dirname, '../export/ep_data.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// INSERT 문들만 추출 (헤더 제외)
const lines = sqlContent.split('\n');
const insertLines = lines.filter(line => line.trim().startsWith('insert into public.ep_data'));

console.log(`총 INSERT 문 개수: ${insertLines.length}`);

// 100개씩 청크로 나누기
const chunkSize = 100;
const chunks = [];

for (let i = 0; i < insertLines.length; i += chunkSize) {
  const chunk = insertLines.slice(i, i + chunkSize);
  chunks.push(chunk);
}

console.log(`총 청크 개수: ${chunks.length}`);

// 청크 파일들 생성
const chunksDir = path.join(__dirname, '../export/chunks_100');
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

chunks.forEach((chunk, index) => {
  const chunkNumber = index + 1;
  const chunkContent = chunk.join('\n');
  const chunkFilePath = path.join(chunksDir, `chunk_${chunkNumber.toString().padStart(3, '0')}.sql`);
  
  fs.writeFileSync(chunkFilePath, chunkContent);
  console.log(`청크 ${chunkNumber} 생성 완료: ${chunk.length}개 INSERT 문`);
});

console.log(`\n모든 청크 파일이 ${chunksDir}에 생성되었습니다.`);
console.log(`각 청크는 100개의 INSERT 문을 포함합니다.`);
