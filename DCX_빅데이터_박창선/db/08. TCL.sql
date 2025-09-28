-- 08. TCL

-- TCL (TRANSACTION CONTROL LANGUAGE) : 트랜잭션 제어어

--트랜잭션이란?
--> 데이터베이스의 상태를 변화시키기 위해서 수행하는 최소 수행 단위.
--> 즉 업무를 처리하기 위한 최소 수행 단위이다.

-- [ 트랜잭션의 4가지 특성 ] --ACID
-- ATOMICITY (원자성)   : ALL OR NOTHING , 모두 실행되거나, 전혀 실행되지 않거나.
-- CONSISTENCY (일관성) : 언제나 일관성 있는 상태로 유지 하는 것
-- ISOLATION (고립성)   : 트랜잭션 실행 시 다른 트랜잭션의 영향을 받지 않는 것.
-- DURABILITY (지속성)  : 성공적으로 수행 된 트랜잭션은 영원히 반영 되는것.

-- [TCL의 명령어]
-- ROLLBACK  : 트랜잭션을 취소, 마지막 COMMIT 시점까지만 복구가 가능하다.
-- COMMIT    : 데이터베이스에 영구적으로 저장, 마지막 COMMIT 시점 이후에 트랜잭션 결과를 저장.
-- SAVEPOINT : 하나의 트랜잭션을 작게 분할하여 저장하는 기능을 수행하는 명령어

-- 테이블 복사
-- EMP 테이블이 모든 정보가 담긴 TEXT_EMP 테이블을 만들어 주세요.
CREATE TABLE TEXT_EMP AS SELECT * FROM EMP;
SELECT * FROM TEXT_EMP;

-- 데이터 추가하기
-- EMPNO : 8000, 이름 : 박창선, JOB: CEO, SAL : 7000, COMM: 1500, DEPTNO : 10
INSERT INTO TEXT_EMP (EMPNO,ENAME, JOB, SAL, COMM, DEPTNO)
VALUES(8000 ,'박창선','CEO',7000, 1500, 10);

SELECT * FROM TEXT_EMP;

ROLLBACK; -- 되돌리는 명령어

COMMIT; 

ROLLBACK;


