-- CHAPTER 02. WHERE --

-- WHERE  절 기본 사용방법
-- 3. SELECT 조회할 컬럼 이름
-- 1. FROM   조회하고자 하는 테이블 이름
-- 2. WHERE  조회하고자 하는 행(데이터)을 선별하기 위한 "조건식";

-- 산술 연산자 (+,-,*,/)
-- 직원의 연봉 정보를 조회


-- 비교연산자
-- = : 같다.
-- > : 보다 크다 (초과)
-- >=: 보다 크거나 같다 (이상)
-- < : 보다 작다 (미만)
-- <=: 보다 작거나 같다 (이하)

-- 직원 테이블에서 직원ID가 105인 직원의 이름과 급여 정보를 조회.
SELECT FIRST_NAME, SALARY, EMPLOYEE_ID 
FROM EMPLOYEES
WHERE EMPLOYEE_ID=105;
-- 부서 테이블에서 매니저ID가 100인 부서이름과 부서ID를 조회.
SELECT MANAGER_ID, DEPARTMENT_NAME,DEPARTMENT_ID
FROM DEPARTMENTS
WHERE MANAGER_ID=100;

-- 문제1) 급여를 9000 받는 직원의 아이디, 이름, 연락처 정보를 조회.
SELECT EMPLOYEE_ID, FIRST_NAME, PHONE_NUMBER, SALARY
FROM EMPLOYEES
WHERE SALARY = 9000;

-- 문제2) 급여가 5000이하인 직원의 이름과 급여와 이메일 정보를 조회.
SELECT FIRST_NAME, EMAIL, SALARY
FROM EMPLOYEES
WHERE SALARY <= 5000;

-- 문제3) 연봉이 120000 이상인 직원의 이름과 급여와 연봉 그리고 연봉의 정보를 조회.
-- 단 연봉은 연봉이라는 별칭으로 출력을 해주세요.

SELECT FIRST_NAME, SALARY, SALARY*12 AS " 연봉"
FROM EMPLOYEES
WHERE SALARY*12 >=120000;

-- 리터럴 {LITERAL}이란?
--> 소스 코드에서 특정한 자료형의 값을 직접 표현하는 방식을 말한다.
-- 즉 소스 코드의 고정된 값을 나타내는 표기법

SELECT FIRST_NAME -- 직원테이블에 존재하는 컬럼을 조회
    , 1000  -- 숫자형 리터럴 출력
    , 'ABC' -- 문자형 리터럴 출력 > '' 작은 따음표를 붙혀줘야 문자형 자료형으로 인식을 한다.
    FROM EMPLOYEES ;
    
--직원의 JOB_ID 가 ST_MAN인 직원의 이름과 급여와 직업정보를 조회.

SELECT JOB_ID, FIRST_NAME, SALARY
FROM EMPLOYEES
WHERE JOB_ID='ST_MAN';

SELECT * FROM JOBS;

--IT_PROG 인 직업을 가진 직원의 이름과 급여정보를 조회.
SELECT FIRST_NAME, SALARY, JOB_ID
FROM EMPLOYEES
WHERE JOB_ID = 'IT_PROG';

--부정 비교 연산자 
-- !=, <>, ^= : 같지 않다.
-- 논리 비교 연산자
-- NOT A = B = 같지 않다. > 뒤에 오는 조건에 반대되는 결과를 되돌려주는 것
-- 직업이 프로그래머가 아닌 직원의 수는 몇명인가 
SELECT FIRST_NAME, SALARY, JOB_ID
FROM EMPLOYEES
WHERE JOB_ID != 'IT_PROG';
-- 정답 > 102

SELECT *
FROM EMPLOYEES
WHERE JOB_ID != 'IT_PROG';
SELECT * FROM EMPLOYEES;

--사장님이 상사가 아닌 직원은 총 몇명인가
-->정답 > 92명
SELECT MANAGER_ID, EMPLOYEE_ID
FROM EMPLOYEES
WHERE MANAGER_ID != 100;

-- 논리연산자 
-- AND(그리고) : 조건을 모두 만족하는 경우 TRUE 값을 반환 
-- OR(혹은)   : 하나의 조건이라도 만족하는 경우 TRUE 값을 반환

-- 조건이 모두 만족해야만 TRUE가 나오는것이 AND
-- 조건중에 하나만 만족해도 TRUE 가 나오는것은 OR

-- 직원테이블에서 부서가 90이고 급여가 5000이상을 받고 있는 직원의ID와 이름을 조회

SELECT FIRST_NAME, DEPARTMENT_ID, SALARY
FROM EMPLOYEES
WHERE DEPARTMENT_ID=90 AND SALARY>=5000;

-- 부서가 100이거나 입사일이 06년06월02일 이후에 입사한 직원의 이름과 입사날짜 정보를 조회
-- 연도/월/일 EX)03/06/17

SELECT FIRST_NAME, HIRE_DATE, DEPARTMENT_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID=100 OR HIRE_DATE>='06/06/02';

-- 연산자 우선 순위
-- AND > OR
--> OR 연산자부터 수행하기 위해서는 소괄호를 이용해서 우선순위를 바꿔줘야 한다!

SELECT FIRST_NAME, SALARY, DEPARTMENT_ID
FROM EMPLOYEES
WHERE (DEPARTMENT_ID=50 OR DEPARTMENT_ID=90) AND SALARY >=7000;

-- 부서ID가 100이거나 90인 직원중에서 
-- 직원ID가 100인 직원의 직원ID, 이름, 연봉의 정보를 조회.
-- 단 연봉은 'AnnSal'이라는 별칭으로 출력

SELECT FIRST_NAME, SALARY, DEPARTMENT_ID,EMPLOYEE_ID, SALARY*12 AS AnnSal
FROM EMPLOYEES
WHERE (DEPARTMENT_ID = 100 OR DEPARTMENT_ID = 90)AND EMPLOYEE_ID = 100;
-- NULL은 비교자체도 안된다 > 무조건 FALSE 값이 나온다.!!

-- NULL 연산자
-- IS NULL : 데이터 값이 NULL인 값을 조회
-- IS NOT NULL : 데이터 값이 NULL이 아닌 값을 조회.

--보너스를 받고 일하는 직원의 수는 몇명인가 35
SELECT COMMISSION_PCT
FROM EMPLOYEES 
WHERE COMMISSION_PCT IS NOT NULL;

--부서가 없는 직원의 이름은 ?
SELECT FIRST_NAME DEPARTMENT_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID IS NULL;

-- 매니저가 없는 직원의 핸드폰 번호를
SELECT PHONE_NUMBER, MANAGER_ID
FROM EMPLOYEES
WHERE MANAGER_ID IS NULL;

-- IN 연산자
-- 특정 컬럼에 포함된 데이터를 여러 개 조회할 때 사용하는 연산자.
-- = + OR 결과값으로  만들어 진 것
-- IN 연산자는 NULL 값을 무시하는 특성을 가지고 있다.
-- 부서가 30,50,90인 직원들의 정보를 조회.

SELECT DEPARTMENT_ID, EMPLOYEE_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID=30 OR DEPARTMENT_ID=50 OR DEPARTMENT_ID=90;

SELECT DEPARTMENT_ID, EMPLOYEE_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID IN(30,50,90,NULL); --오답

SELECT JOB_ID
FROM EMPLOYEES
WHERE JOB_ID IN('ST_MAN', 'SA_MAN');

--이메일 정보가 DLEE, KGEE, SANDE 인 직원의 이름과 전화번호 정보를 조회.
SELECT FIRST_NAME, PHONE_NUMBER, EMAIL
FROM EMPLOYEES
WHERE EMAIL IN('DLEE', 'KGEE', 'SANDE');

--NOT IN : IN 뒤에 조건에 해당하지 않는 데이터 출력
-- != + AND

-- -- 부서가 30,50,90인 직원들의 정보를 조회.
SELECT DEPARTMENT_ID, EMPLOYEE_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID !=30 
    AND DEPARTMENT_ID !=50 
    AND DEPARTMENT_ID != 90;
    
SELECT DEPARTMENT_ID, EMPLOYEE_ID
FROM EMPLOYEES
WHERE DEPARTMENT_ID NOT IN (30,50,90) ; 

--BETWEEN A AND B 연산자 (범위 연산자)
-- 일정 범위 내의 데이터를 조회할 때 사용
-- BETWEEN 최소값 AND 최대값 : 최소값 이상 최대값 이하
-- 특정 열 값의 최소, 최고 범위를 지정하여 해당 범위 내의 데이터만 조회하는 것 

-- 급여가 10000이상 20000이하의 범위내에서 받고 있는 직원의 이름과 급여 정보를 조회.
SELECT SALARY, FIRST_NAME
FROM EMPLOYEES
WHERE SALARY BETWEEN 10000 AND 20000;

-- 2005년에 입사한 직원은 총 몇명인가?
SELECT HIRE_DATE
FROM EMPLOYEES
WHERE HIRE_DATE BETWEEN '05/01/01' AND '05/12/31';

-- LIKE 연산자
-- 일부 문자열이 포함된 데이터를 조회할 때 사용 -> ''잊으면 안됨
-- %,_와 같은 와일드 카드를 이용해서 매칭 연산을 진행 하는 것 

-- % : 길이와 상관 없이 모든 문자 데이터를 의미
-- _ : 어떤 값이든 상관 없이 한개의 문자 데이터를 의미

-- 직원테이블에서 650으로 시작하는 핸드폰 번호를 찾기

SELECT PHONE_NUMBER 
FROM EMPLOYEES;


--직원 테이블에서 FIRST_NAME 이 s로 시작하고 n으로 끝나는 직원의 FIRST_NAME 찾기
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE 'S%' AND FIRST_NAME LIKE '%n';
--직원테이블에서 FIRST_NAME이 it으로 끝나고 총 4글자인 직원의 FIRST_NAME 찾기
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '%it' AND FIRST_NAME LIKE '____';
--직원테이블에서 이름이 두번째 글자가 e인 직원의 FIRST_NAME 찾기
SELECT FIRST_NAME
FROM EMPLOYEES
WHERE FIRST_NAME LIKE '_e%' ;
--직원테이블에서 01월에 입사한 직원의 입사정보 찾기.
SELECT HIRE_DATE
FROM EMPLOYEES
WHERE HIRE_DATE LIKE '__/01%';

-- ORDER BY 절
-- 특정 컬럼을 기준으로 정렬된 상태로 출력하고자 할때 사용한다.
-- SQL 실행 순서에서 가장 마지막에 실행이 된다.
-- 별도로 정렬방식을 지정하지 않으면 기본적으로 오름차순이 정렬이 된다.

-- ASC (Asending) : 오름차순 정렬 (1,2,3,4,5....)
-- DESC (Descending) : 내림차순 정렬 (10,9,8,7,.....)

--급여를 높게 받는 직원 순으로 출력을 해봐라.
SELECT FIRST_NAME, SALARY
FROM EMPLOYEES
ORDER BY SALARY ASC;

--최근에 입사한 날짜를 기준으로 직원의 이름과 입사날짜를 조회.

SELECT FIRST_NAME, HIRE_DATE
FROM EMPLOYEES
ORDER BY HIRE_DATE DESC;

-- 직원테이블에서 직원ID, 부서ID, 이름, 급여 순으로 출력
-- 단 부서ID는 오름차순으로 정렬, 급여는 내림차순으로 정렬하여 출력.
SELECT EMPLOYEE_ID, DEPARTMENT_ID, FIRST_NAME, SALARY
FROM EMPLOYEES
ORDER BY DEPARTMENT_ID ASC, SALARY DESC;

 -- 부서별 높은 급여를 받는 직원들 순으로 출력이 되었다.