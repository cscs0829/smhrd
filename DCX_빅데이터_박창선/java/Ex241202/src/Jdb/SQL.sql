-- 회원테이블 만들기(id, pw, name, age)
-- 실행할 쿼리문 전체 블룩 후 ALT+X
-- sql results 나오게 하기 돋보기 data 검색 New Oravle 두번 클릭
CREATE TABLE MEMBER(
   ID VARCHAR(50),
   PW VARCHAR(50),
   NAME VARCHAR(50),
   AGE NUMBER
);

-- TEST 데이터 넣기 
INSERT INTO MEMBER VALUES('TEST1', 'TEST1','테스트1', 0);
INSERT INTO MEMBER VALUES('TEST2', 'TEST2','테스트2', 10);

-- MEMBER 테이블 조회
SELECT * FROM MEMBER;

--회원정보 수정 쿼리
UPDATE MEMBER SET PW = '0000' WHERE ID='JUHEE';

--회원 삭제 쿼리 (ID, PW)
DELETE FROM MEMBER WHERE ID = '1203' AND PW = '1111'

-- 로그인 
SELECT * FROM MEMBER WHERE ID = 'TEST1' AND PW = 'TEST1';



