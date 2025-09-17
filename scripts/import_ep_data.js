const fs = require('fs');
const path = require('path');

// SQL 파일을 읽어서 INSERT 문들을 청크 단위로 나누는 함수
function splitSQLIntoChunks(sqlFilePath, chunkSize = 50) {
    console.log('SQL 파일을 읽는 중...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // INSERT 문들을 찾기 위한 정규식
    const insertRegex = /^insert into public\.ep_data \([\s\S]*?\) on conflict \(id\) do update set[\s\S]*?updated_at = now\(\);/gim;
    
    const insertStatements = [];
    let match;
    
    while ((match = insertRegex.exec(sqlContent)) !== null) {
        insertStatements.push(match[0]);
    }
    
    console.log(`총 ${insertStatements.length}개의 INSERT 문을 찾았습니다.`);
    
    // 청크 단위로 나누기
    const chunks = [];
    for (let i = 0; i < insertStatements.length; i += chunkSize) {
        const chunk = insertStatements.slice(i, i + chunkSize);
        chunks.push(chunk);
    }
    
    console.log(`${chunks.length}개의 청크로 나누었습니다. (청크당 ${chunkSize}개)`);
    
    return chunks;
}

// 청크를 파일로 저장하는 함수
function saveChunksToFiles(chunks, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    chunks.forEach((chunk, index) => {
        const filename = `chunk_${String(index + 1).padStart(3, '0')}.sql`;
        const filepath = path.join(outputDir, filename);
        
        const sqlContent = chunk.join('\n\n');
        fs.writeFileSync(filepath, sqlContent, 'utf8');
        
        console.log(`청크 ${index + 1}을 ${filename}에 저장했습니다.`);
    });
}

// 메인 실행 함수
function main() {
    const sqlFilePath = path.join(__dirname, '../export/ep_data.sql');
    const outputDir = path.join(__dirname, '../chunks');
    
    try {
        // SQL 파일을 청크로 나누기
        const chunks = splitSQLIntoChunks(sqlFilePath, 50); // 청크당 50개씩
        
        // 청크를 파일로 저장
        saveChunksToFiles(chunks, outputDir);
        
        console.log(`\n=== 분할 완료 ===`);
        console.log(`총 ${chunks.length}개의 청크 파일이 생성되었습니다.`);
        console.log(`출력 디렉토리: ${outputDir}`);
        
    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { splitSQLIntoChunks, saveChunksToFiles };
