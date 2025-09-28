CREATE TABLE BOOK(
	BOOK_NUM NUMBER PRIMARY KEY,
	BOOK_NAME VARCHAR(50),
	BOOK_WRITER VARCHAR(50),
	BOOK_PRICE VARCHAR(100),
	
);
ALTER TABLE BOOK ADD is_rented CHAR(1) DEFAULT 'Y';


BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE NUM_SEQ INCREMENT BY 1 START WITH 1';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- 이미 존재할 경우 무시
END;


-- 시퀀스 번호 생성 : num_seq
CREATE SEQUENCE NUM_SEQ
INCREMENT BY 1
START WITH 1;

-- TEST 데이터 넣기 
INSERT INTO BOOK VALUES(NUM_SEQ.NEXTVAL, 'TEST1', 'TEST1','TEST1');
INSERT INTO BOOK VALUES(NUM_SEQ.NEXTVAL, 'TEST2', 'TEST2','TEST2');
INSERT INTO BOOK VALUES(NUM_SEQ.NEXTVAL, 'TEST3', 'TEST3','TEST3');

insert into BOOK values(num_seq.nextval, '소년이 온다', '한강', '13,500');
insert into BOOK values(num_seq.nextval, '트렌드 코리아 2025', '김난도', '18,000');
insert into BOOK values(num_seq.nextval, '일의 감각', '조수용', '19,000');
insert into BOOK values(num_seq.nextval, '넥서스', '유발 하리라', '25,050');

-- MEMBER 테이블에 BOOK_NAME 컬럼 추가하기 
ALTER TABLE MEMBER ADD BOOK_NAME VARCHAR(50) DEFAULT '-';

SELECT * FROM BOOK;




