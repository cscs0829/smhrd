-- 06. DDL

--DDL(DATA DIFINITION LANGUAGE) 정의를 내리는 언어 데이터 정의어
--> 테이블같은 저장소 객체를 만들거나 수정

-- [DDL 명령어 종류]
-- CREATE : 테이블 같은 객체를 생성하는 명령어
-- ALTER : 테이블 같은 객체를 변경하는 명령어
-- RENAME : 테이블의 이름을 변경하는 명령어
-- TRUNCATE : 테이블의 데이터를 삭제하는 명령어
-- DROP :테이블 같은 객체를 삭제하는 명령어
--};
/*
CREATE TABLE [테이블 명] {
[컬럼 명1] [자료형] 제약조건,
[컬럼 명2] [자료형] 제약조건,
.....
[컬럼 명N] [자료형] 제약조건
};

*/

DESC DEPT ; -- 테이블 이름을 드래그로 감싼 후 SHIFT + F4

CREATE TABLE DEPT (
    DEPTNO NUMBER(2,0),
    DNAME VARCHAR2(14),
    LOC VARCHAR2(13)
);

SELECT * FROM DEPT;


-- 실습) SCOTT 계정의 EMP 테이블을 HR 계정에 만들어보자.
SELECT * FROM EMP;

DESC DEPT ;

CREATE TABLE EMP(
EMPNO NUMBER(4,0),
ENAME VARCHAR2(10),
JOB VARCHAR2(9),
MGR NUMBER(4,0),
HIREDATE DATE,
SAL NUMBER(7,2),
COMM NUMBER(7,2),
DEPTNO NUMBER(2,0)
);

-- [테이블 생성시 자주 사용하는 자료형]
-- VARCHAR2(N) : 가변형 문자형, N크기만큼 입력 받음
-- NUMBER(P,S) : 숫자형 값을 P자리 만큼 입력 받고 S자리 만큼 소수를 입력받음
-- EX) NUMBER(4,0) -> 9999.0, NUMBER(4,3) -> 9.999, NUMBER(7,2) -> 99999.99
-- 오라클 데이터베이스에서는 실수와 정수 모두 표현이 가능하다.
-- 소괄호를 생략하게 되면 최대값이 38 크기가 들어간다. -> NUMBER 
-- DATE : 현재 날짜 값을 입력받는다.

--제약조건이란?
--> 테이블에 입력 가능한 데이터를 조건을 제약하는 것 
--> 데이터의 정확성을 유지하기 위한 목적으로 사용한다.
--> 제약조건 지정 방식에 따라서 데이터의 수정이나 삭제 여부에 영향을 받는다.

-- 제약조건 종류
-- PRIMARY KEY(PK) : 기본키, NOT NULL + UNIQUE -> NULL 불가 + 중복 불가
-- UNIQUE KEY(UK) : 고유키, NULL 값 입력 가능, 단 중복은 불가
-- NOT NULL : NULL값 불가능, 꼭 입력되어야 하는 데이터이다 할 때 설정 함.
-- CHECK : T OR F로 평가할 수 있는 논리식 지정, 지정한 데이터만 입력이 가능
-- FOREGN KEY(FK) : 외래키, 테이블을 연결하는 키

-- 테이블에 제약조건을 지정하기.

-- [사용방법]
-- ALTER TABLE [테이블 명] ADD CONSTRAINT [제약조건이름] [제약조건(컬럼)];

SELECT * FROM EMP;
ALTER TABLE EMP ADD CONSTRAINT EMPNO_PK PRIMARY KEY(EMPNO);

-- 실습
-- DEPT 테이블에서 DEPTNO 컬럼을 PK로 지정하기
SELECT * FROM DEPT;
ALTER TABLE DEPT ADD CONSTRAINT DEPTNO_PK PRIMARY KEY(DEPNO);

SELECT * FROM EMP;

-- UK 제약조건 지정하기 
ALTER TABLE EMP ADD CONSTRAINT JOB_UK UNIQUE(JOB);

--CHECK 제약조건 지정하기 
--급여를 1000이상 20000만 이하로 데이터가 들어갈 수 있도록 제약조건 걸기
ALTER TABLE EMP ADD CONSTRAINT SAL_CHECK CHECK(SAL BETWEEN 1000 AND 20000);

-- FK제약조건 지정하기
-- FK제약조건 지정하는 방법
-- ALTER TABLE [테이블명] ADD CONSTRAINT[제약조건 명] [제약조건(컬럼)]
-- REFERENCES [참조테이블(참조컬럼명)];

-- EMP 테이블의 DEPTNO 컬럼을 FK로 지정을 해주세요!
-- 참조 테이블 : DEPTNO 테이블의 PK로 참조를 해주세요!

ALTER TABLE EMP ADD CONSTRAINT EMP_DEPTNO_FK FOREIGN KEY(DEPTNO)
REFERENCES DEPT(DEPTNO);

-- 제약조건 변경하기 -ALTER 
-- ALTER TABLE [테이블명] MODIFY [컬럼 명] [바꿀 제약조건];

SELECT * FROM EMP;
ALTER TABLE EMP MODIFY ENAME NOT NULL ;

-- 제약조건 삭제하기 - DROP
-- ALTER TABLE [테이블명] DROP CONSTRAINT [제약조건 이름] ;
--EMP 테이블의 JOB 컬럼의 제약조건을 삭제하기
ALTER TABLE EMP DROP CONSTRAINT JOB_UK;

-- 테이블의 컬럼을 추가하기
-- 직원의 핸드폰 번호를 받기 위한 컬럼을 추가하기
-- ALTER TABLE [테이블명] ADD[컬럼명] [자료형(크기)];
-- EMP 테이블에서 PHONE_NUMBER 컬럼을 추가하기 자료형은 VARCHARE2(10)
ALTER TABLE EMP ADD PHONE_NUMBER VARCHAR2(10);

DESC EMP;

-- 특정 컬럼의 이름을 변경하기
-- TEL 이라는 컬럼명으로 바꾸기 
-- ALTER TABLE [테이블명] RENAME COLUMN [기존컬럼명] TO [바꿀 컬럼명] ;
ALTER TABLE EMP RENAME COLUMN PHONE_NUMBER TO TEL ;

-- 컬럼의 자료형을 변경하기
-- ALTER TABLE [테이블 명] MODIFY [컬럼 명] [변경할 자료형(크기)];
ALTER TABLE EMP MODIFY TEL VARCHAR2(100);

-- 특정 컬럼을 삭제하기
-- ALTER TABLE [테이블 명] DROP COLUMN [컬럼 명] ;
ALTER TABLE EMP DROP COLUMN TEL ;

SELECT * FROM EMP;

-- 테이블 삭제 
-- DROP  TABLE [테이블 명];

--테이블 복사하는 쿼리문
--> 제약조건은 복사가 되지 않습니다. -> 오로지 데이터 내용만 복사가 된다!
-- CREATE TABLE [테이블 명] AS [복사할 내용이 있는 쿼리문];
CREATE TABLE TEST_EMPLOYEES AS SELECT * FROM EMPLOYEES;

SELECT * FROM TEST_EMPLOYEES;

-- TRUNCATE : 데이터를 영구 삭제 
-- TRUNCATE TABLE [테이블명] ;

TRUNCATE TABLE TEST_EMPLOYEES;

DROP TABLE TEST_EMPLOYEES;



