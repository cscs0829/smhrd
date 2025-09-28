-- CHAPTER 04. GROUP BY/ HAVING --

-- GROUP BY : 특정 컬럼을 기준으로 그룹화 할 때 사용
-- EX) 부서별(부서컬럼을 기준으로 그룹화)로 평균값을 구하세요~

-- 부서 ID를 기준으로 직원을 그룹화하기
-- 각 부서에 속해있는 직원의 수 출력하기
SELECT DEPARTMENT_ID, COUNT(*) AS "직원 수"
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY 1 DESC;

-- GROUP BY 절보다 뒤에 실행되는 절에서는 컬럼 제한
-- ORA-00979: NOT A GROUP BY EXPRESSION
-- 실행 안되는 이유! : 그룹화를 하게 되면 실제 출력되는 행이 감사 -> 출력될 수 있는 컬럼이 제한
-- 이미 그룹화로 실행시킨 행의 개수(12개)와 기존 EMPLOYEE행의 개수 (107개)가 맞지 않기 때문에!
-- MUST APPEAR IN THE GROUP BY CLAUSE OR BE USED IN AN AGGREGATE FUNCTION"

SELECT DEPARTMENT_ID, EMPLOYEE_ID
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
ORDER BY 1 DESC;

-- 단일행함수 : 함수에 입력되는 행의 개수가 1개로, 각 행에 대한 결과값을 도출
SELECT FIRST_NAME, UPPER(FIRST_NAME), LOWER(FIRST_NAME)
FROM EMPLOYEES;

-- 다중행함수 : 함수에 입력되는 행의 개수가 여러 개로, 여러개의 행을 바탕으로 1개의 결과값을 도출
SELECT SUM(SALARY)
FROM EMPLOYEES;

-- 부서별로 급여를 받는 직원의 수, 총합, 평균, 최대값, 최소값을 구해보자
SELECT DEPARTMENT_ID
        , COUNT(DEPARTMENT_ID)
        , SUM(SALARY) AS 총합
        , ROUND(AVG(SALARY)) AS 평균
        , MAX(SALARY) AS 최대값
        , MIN(SALARY) AS 최소값
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID;

-- COUNT(*) VS COUNT(컬럼명)
-- COUNT(*) : NULL 포함
-- COUNT(컬럼명) : NULL 포함 X
SELECT DEPARTMENT_ID, COUNT(*), COUNT(DEPARTMENT_ID)
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID;

-- HAVING절 : GROUP BY절을 통해서 그룹화 된 결과 중에서 원하는 결과로 필터링하는 문법
-- HAVING절에는 GROUP BY절에 있는 컬럼만 사용이 가능!

-- 학생의 전체 과목의 평균성적이 80점 이하인 학생만 출력
SELECT 학생ID, ROUND(AVG(성적)) AS 평균성적
FROM 성적표
GROUP BY 학생ID
HAVING AVG(성적) < 80;

-- 수강생 정보에서 소속된 팀의 인원수가 3명 이상인 팀만 출력


-- 아이디가 SMHRD1인 학생의 전체 과목의 평균성적을 출력
SELECT 학생ID, ROUND(AVG(성적)) AS 평균성적
FROM 성적표
GROUP BY 학생ID
HAVING 학생ID=('SMHRD1');

--파이썬 성적을 제외한(조건 - 그룹화하기전에 파이썬 제거 -> WHERE) 평균이 80 이상인 학생을 출력
SELECT 학생ID, ROUND(AVG(성적)) AS 평균성적
FROM 성적표
WHERE 과목 !='PYTHON'
GROUP BY 학생ID
HAVING AVG(성적) > 80;

--수강생 정보에서 소속된 팀의 인원수가 3명 이상인 팀만 출력
SELECT 팀, COUNT(학생ID)
FROM 교육생정보
GROUP BY 팀
HAVING COUNT(학생ID) >= 3;

-- 직원 테이블에서 부서별 최고 연봉이 100,000이상인 부서만 출력
SELECT DEPARTMENT_ID, MAX(SALARY) * 12 AS 최고연봉
FROM EMPLOYEES
GROUP BY DEPARTMENT_ID
HAVING MAX(SALARY* 12) >= 100000;



