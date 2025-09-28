-- 07. DML

-- DML(DATA MANIPULATION LANGUAGE) : 데이터 조작어
--> 데이터 조작어로 테이블에 데이터를 조회, 추가, 수정, 삭제 할 때 사용하는 질의어이다.
--> 테이블에서 원하는 데이터를 입력, 수정, 삭제한다.

-- DML 유형
-- SELECT : 데이터를 조회
-- INSERT : 데이터를 추가
-- UPDATE : 데이터를 수정
-- DELETE : 데이터를 삭제

-- INSERT : 데이터 추가하는 방법
-- INSERT INTO 테이블 명 (컬럼명1, 컬럼명2, 컬럼명N..)
-- VALUES (컬럼명1, 컬럼명2, 컬럼명N..)
--> INSERT INTO에 입력한 컬럼LIST와 VALUES에 입력한 값은 "순서"와 "자료형"이 맞아야 된다.

-- INSERT INTO 테이블명 (컬럼LIST
-- VALUES(값)
-- > INSERT에 컬럼 LIST 생략시 VALEUS는 테이블의 컬럼 수의 순서와 자료형이 맞아야 된다.

SELECT *FROM DEPT;

INSERT INTO DEPT (DEPTNO, DNAME, LOC)
VALUES (10,'ACCOUNTING', 'NEW YORK');

INSERT INTO DEPT (DEPTNO, DNAME, LOC)
VALUES (20,'RESEARCH', 'DALLAS');

INSERT INTO DEPT (DEPTNO, DNAME, LOC)
VALUES (30,'SALES', 'CHICAGO');

INSERT INTO DEPT (DEPTNO, DNAME, LOC)
VALUES (40,'OPERATIONS', 'BOSTON');

SELECT * FROM EMP;

-- SCOTT 계정의 EMP 테이블에서 EMPNO가 7521인 직원의 모든 정보를 추가해주세요
INSERT INTO EMP (EMPNO,ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
VALUES(7521 ,'WARD','SALESMAN',7698, '1982-02-22', 1250, 500, 30);

SELECT * FROM EMP;

-- 테이블의 NULL 값 입력
-- > NULL, '' ->명시적으로 입력

-- 7369인 직원의 정보 추가하기
SELECT * FROM EMP WHERE EMPNO = 7639;

INSERT INTO EMP (EMPNO,ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
VALUES(7369 ,'SMITH','CLERK',7902, '1980-12-17', 800, NULL, 30);

--EMP테이블의 SAL컬럼에 CHECK 제약조건 삭제
-- 제약조건 삭제하기 - DROP
-- ALTER TABLE [테이블명] DROP CONSTRAINT [제약조건 이름] ;

ALTER TABLE EMP DROP CONSTRAINT SAL_CHECK;
SELECT *FROM EMP;
SELECT *FROM EMP WHERE EMPNO = 7566;

INSERT INTO EMP (EMPNO,ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
VALUES(7566 ,'JONES','MANAGER',7839, '1981-04-02', 2975, NULL, 20);

SELECT * FROM EMP; 

SELECT * FROM EMP WHERE EMPNO = 7902;

--7902인 직원 추가하기 
INSERT INTO EMP (EMPNO,ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
VALUES(7902 ,'FORD','ANALYST',7566, '1981-12-03', 3000, NULL, 20);


SELECT * FROM EMP WHERE EMPNO =7934;  

--EMPNO가 7934인 직원의 정보를 추가하기
INSERT INTO EMP (EMPNO,ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO)
VALUES(7934 ,'MILLER','CLERK',7782, '1982-01-23', 1300, NULL, 10);
SELECT * FROM EMP;

-- UPDATE : 테이블의 데이터를 변경하고 싶을 때 사용하는 명령어

-- UPDATE 테이블 명
-- SET 변경할 컬럼 = 데이터 값
-- WHERE  데이터를 변경할 대상 행을 선별하기 위한 조건
-- ** WHERE 조건절을 생략 가능 > 하지만 생략을 하게 되면 테이블 내 저장된 모든 컬럼의 데이터가 변경이 된다!

SELECT * FROM EMP;

UPDATE EMP
SET SAL = 1000
WHERE ENAME = 'SMITH';

-- UPDATE 나 DELETE를 하는 경우 조건에는 특정 컬럼 기준을 PK로 하는것이 좋다!

-- 실습 이름이 FORD라는 직원의 보너스를 300으로 책정, 급여를 3500으로 인상을 해주세요!

UPDATE EMP
SET COMM = 300,
    SAL = 3500
WHERE ENAME = 'FORD';
SELECT * FROM EMP;

--DELETE : 데이터를 삭제할 때 사용하는 명령어
--DELETE FROM 테이블이름
--WHERE 삭제할 대상 행을 선별하기 위한 조건식;
--** WHERE 조건절 생략가능 단 생략할 경우 테이블의 모든 데이터가 삭제가 된다!!

-- EMPLOYEES 테이블의 모든 정보를 T_MAP테이블에 복사를 해주세요.
CREATE TABLE T_EMP AS SELECT * FROM EMPLOYEES;


--테이블 복사하는 쿼리문
--> 제약조건은 복사가 되지 않습니다. -> 오로지 데이터 내용만 복사가 된다!
-- CREATE TABLE [테이블 명] AS [복사할 내용이 있는 쿼리문];
SELECT * FROM T_EMP;

DELETE FROM T_EMP;

ROLLBACK;

TRUNCATE TABLE T_EMP;
--> TRUNCATE 는 데이터 삭제하는 명령어 하지만 영구 삭제라서 ROLLBACK이 적응이 안된다!!
-- DELETE도 데이터를 삭제하는 명령어지만 ROLLBACK이 적용이되서 복구가 가능하다!

ROLLBACK;

SELECT *FROM EMP;

COMMIT ; --저정하는 명령어

-- EMPNO가 7521인 직원의 정보를 삭제

DELETE FROM EMP
 WHERE EMPMO = 7521 ;
