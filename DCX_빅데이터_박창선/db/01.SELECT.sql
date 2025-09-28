--CHAPHER 01. SELECT --

--주석기호

--주석 색깔 바꾸기 : 도구 > 환경설정 > 코드편집기 > PL/SQL주석

desc employees ;
-- desc(describe) : sql에서 사용되는 데이터베이스 테이블의 구조를 확인하는 명령어

--주석형태(2) : /**/ -> 여러줄을 한번에 주석처리가 가능한 주석형태

/*
여는주석
1 SQL 문장에는 대소문자를 구분하지 않는다.
2 띄어쓰기나 줄바꿈 또한 명령어 수행에 영향을 주지 않는다.
3 SQL 문장 끝에는 반드시 ;(세미클론)을 찍어줘야 한다.
4 SQL 실행 단축기 : CTRL + ENTER, F9
닫는주석
*/

DESC EMPLOYEES ;

-- [SELECT 절 기본 사용방법]
-- SELECT 조회할 컬럼 이름
-- FROM 조회할 테이블 이름

-- 직원테이블에서 직원의 이름을 조회.
/*SELECT FIRST_NAME, LAST_NAME
FROM EMPLOYEES ;

DESC EMPLOYEES;
--직원테이블에서 직원ID, 이메일, 전화번호, 급여(SALARY)의 정보를 조회.

SELECT EMPLOYEE_ID, EMAIL, PHONE_NUMBER, SALARY
FROM EMPLOYEES ;
*/
-- 부서테이블에서 부서ID, 부서명 정보를 조회.
DESC DEPARTMENTS;
SELECT DEPARTMENT_NAME,DEPARTMENT_ID
FROM DEPARTMENTS ;

--(아스타리스크) : 전체를 의미를 한다.

-- 직원테이블의 전체 정보를 출력
SELECT *
FROM EMPLOYEES ;

--부서테이블의 전체 정보를 출력
SELECT *
    FROM DEPARTMENTS ;
    
--- 직원테이블에서 부서아이디를 조회.

SELECT DEPARTMENT_ID
FROM EMPLOYEES ;

--DISTINCT : 데이터 중복을 제거 해주는 키워드

--SELECT[ALL/DISTINCT] 조회하고자 하는 컬럼
--FROM 테이블 이름

SELECT DISTINCT DEPARTMENT_ID
    FROM EMPLOTEES;
    
-- 직원테이블에서 직업ID을 중복을 제거하여 조회.
SELECT DISTINCT JOB_ID
    FROM EMPLOYEES ;
    
--직원테이블에서 직원의 이름과, 급여의 정보를 조회.

SELECT FIRST_NAME,LAST_NAME, SALARY
FROM EMPLOYEES;

--컬럼의 유형이 숫자형 이거나 날짜형이면 연산이 가능하다 ( +, -, *, /)
DESC EMPLOYEES;

-- 직원의 이름과 급여와, 연봉의 정보를 조회.
SELECT FIRST_NAME, SALARY*12 
FROM EMPLOYEES;

--직원의 이름과 급여와 이메일, 입사날짜, 입사날짜다음날의 정보를 조회.
SELECT FIRST_NAME, EMAIL, HIRE_DATE ,HIRE_DATE+1
FROM EMPLOYEES;

-- 별칭 사용하기 (ALIAS)
-- 1. SELECT 조회하고자 하는 컬럼명 별칭
-- 2. SELECT 조회하고자 하는 컬럼명 "별칭"
-- 3. SELECT 조회하고자 하는 컬럼명 AS 별칭
-- 4. SELECT 조회하고자 하는 컬러명 AS "별칭"

-- 직원의 이름과 급여와 연봉의 정보를 조회, 단 연봉을 연봉이라고 별칭으로 조회.
SELECT FIRST_NAME, SALARY, SALARY*12 "연봉"
FROM EMPLOYEES;

SELECT FIRST_NAME, SALARY, SALARY*12 AS "연봉"
FROM EMPLOYEES;

SELECT FIRST_NAME, SALARY, SALARY*12 AS 연봉
FROM EMPLOYEES;

-- NULL 값이란?
-- NULL 값이란 데이터의 값이 완전히 비어 있는 상태를 말한다.
-- 값이 존재하지 않거나 정해지지 않은 것을 의미한다.
-- 숫자0 과 빈 문자열 " "은 NULL값이 아니다.
-- NULL 과 연산을 하게 되면 무조건 결과 값은 NULL값이 나온다.
-- EX} 100 * NULL

DESC EMPLOYEES;

-- 직원의 이름과 급여와 보너스 정보를 조회.
SELECT FIRST_NAME, SALARY, COMMISSION_PCT
FROM EMPLOYEES;

--직원의 이름과 급여와 보너스 정보를 조회하는데, 보너스를 두배로 책정을 해서 출력
--보너스 두배는 UP_BONUS 라는 별칭으로 출력
SELECT FIRST_NAME, SALARY, COMMISSION_PCT*2 AS "UP_BONUS"
FROM EMPLOYEES;