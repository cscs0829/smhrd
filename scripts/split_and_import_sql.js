const fs = require('fs');
const path = require('path');

// SQL 파일을 읽어서 INSERT 문들을 청크 단위로 나누는 함수
function splitSQLIntoChunks(sqlFilePath, chunkSize = 100) {
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

// 청크를 Supabase에 삽입하는 함수
async function insertChunkToSupabase(chunk, projectId) {
    const { createClient } = require('@supabase/supabase-js');
    
    // Supabase 클라이언트 설정 (환경변수에서 가져오기)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL과 SUPABASE_ANON_KEY 환경변수를 설정해주세요.');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 청크의 모든 INSERT 문을 하나의 트랜잭션으로 실행
    const sqlQuery = chunk.join('\n');
    
    try {
        const { data, error } = await supabase.rpc('execute_sql', { 
            sql: sqlQuery 
        });
        
        if (error) {
            throw error;
        }
        
        console.log(`청크 삽입 완료: ${chunk.length}개 레코드`);
        return { success: true, count: chunk.length };
    } catch (error) {
        console.error('청크 삽입 실패:', error.message);
        return { success: false, error: error.message };
    }
}

// 메인 실행 함수
async function main() {
    const sqlFilePath = path.join(__dirname, '../export/ep_data.sql');
    const projectId = 'cbetujraqbeegqtjghpl'; // Supabase 프로젝트 ID
    
    try {
        // SQL 파일을 청크로 나누기
        const chunks = splitSQLIntoChunks(sqlFilePath, 50); // 청크당 50개씩
        
        console.log(`\n${chunks.length}개의 청크를 Supabase에 삽입합니다...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < chunks.length; i++) {
            console.log(`\n청크 ${i + 1}/${chunks.length} 처리 중...`);
            
            const result = await insertChunkToSupabase(chunks[i], projectId);
            
            if (result.success) {
                successCount += result.count;
                console.log(`✅ 청크 ${i + 1} 성공: ${result.count}개 레코드 삽입`);
            } else {
                errorCount++;
                console.log(`❌ 청크 ${i + 1} 실패: ${result.error}`);
            }
            
            // API 제한을 피하기 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n=== 삽입 완료 ===`);
        console.log(`성공: ${successCount}개 레코드`);
        console.log(`실패: ${errorCount}개 청크`);
        
    } catch (error) {
        console.error('오류 발생:', error.message);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { splitSQLIntoChunks, insertChunkToSupabase };
