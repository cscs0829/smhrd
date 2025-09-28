--직원ID가 100인 직원의 부서 이름을 출력
--1. 100번 직원의 부서ID 찾기 
SELECT  EMPLOYEE_ID, DEPARTMENT_ID, DEPARTMENT_NAME
FROM DEPARTMENTS, EMPLOYEES
WHERE EMPLOYEE_ID=100

--2. 부서ID가 90번인 부서의 이름을 찾기
SELECT DEPARTMENT_ID, DEPARTMENT_NAME
FROM DEPARTMENTS
WHERE DEPARTMENT_ID = 90;

-- JOIN으로 한번에 쿼리 작성하기
SELECT E.EMPLOYEE_ID, D.DEPARTMENT_ID, D.DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID
AND E.EMPLOYEE_ID=100;

--FROM절 : 여러개의 테이블 사용 가능, 테이블에 별칭 사용 가능
--FROM절 이후에 컬럼을 사용할 때는 어떤 테이블의 컬럼인지 명시!

-- ORA-00918: COLUMN AMBIGUOUSLY DEFINED
-- DEPARTMENT_ID는 직원/부서 테이블에 모두 존재하는 컬럼이므로,
-- 어떤 테이블에서 가져올지 정확하게 명시
-- 한 테이블에만 존재하는 컬럼일 경우, 명시X
SELECT E.DEPARTMENT_ID, SALARY
FROM EMPLOYEES E, DEPARTMENTS D;

-- ORA-00904: "EMPLOYEES"."DEPARTMENT_ID": INVALID IDENTIFIER
-- 테이블에 별칭을 설정하고 나면 그 이후의 실행절에서는 *별칭만* 사용해야함!
SELECT EMPLOYEES.DEPARTMENT_ID, SALARY
FROM EMPLOYEES E, DEPARTMENT D;

-- 1. CROSS JOIN(카티션곱)
-- 조인조건을 따로 작성하지 않는 JOIN -- 2889개행(107명X27개부서)
SELECT E.EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D;

-- 2. INNER JOIN(등가조인) 106개
SELECT E.EMPLOYEE_ID, E.DEPARTMENT_ID, D.DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID;

SELECT * FROM EMPLOYEES;

SELECT * FROM 교육생정보;
SELECT * FROM 성적표;

-- 등가조인(EQUI JOIN) : 두 개의 테이블 간에 서로 정확하게 일치하는 경우 활용되는 조인
--> = (등가연산자)를 사용해서 조인을 의미

-- 비등가조인(NON EQUI JOIN) : 두개의 테이블 간에 서로 정확하게 일치하지 않는 경우 활용되는 조인
--> =(등가연산자)가 아닌 연산자들을 사용한 조인을 의미(>, >=, <, <=, BETWEEN)

-- [INNER JOIN 사용방법]
-- 3.SELECT        테이블1.컬럼명, 테이블2.컬럼명    --> 해당테이블에 있는 컬럼을 조인하겠다. (조인 조건에 맞는)
-- 1.FROM          테이블1, 테이블2                --> 테이블1,테이블2를 조인하겠다.
-- 2.WHERE         테이블1.컬럼명 = 테이블2.컬럼명  --> 해당 조건으로 조인하겠다.

SELECT * FROM 교육생정보;
SELECT * FROM 성적표;



-- 교육생정보 테이블에 학생ID, 학생이름, 성적표테이블에 과목과 성적
-- 1. 조인할 대상 테이블의 정보를 확인
-- 2. FROM절에 조인할 테이블을 ,(컴마)를 기준으로 작성
-- 3. WHERE절에 조인 조건이 되는 "특정 컬럼"을 확인하여, 조인 조건을 작성
-- 조인 조건이 되는 특정 컬럼 : 조인할 테이블 간의 같은 결과 값을 가지는 컬럼이다!!
-- 조인 조건이 되는 컬럼은 대부분 PK와 FK 관계로 이루어져 있다. 단 전부 그런것은 아니다!
-- 4. SELECT 절에 출력하고자 하는 컬럼을 .(경로)를 통해서 작성

SELECT A.학생ID, A.학생이름, B.과목, B.성적
FROM 교육생정보 A, 성적표 B
WHERE A.학생ID = B.학생ID; 

-- 직원ID, FIRST_NAME, 급여, 부서이름 정보를 출력

SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.SALARY, D.DEPARTMENT_NAME
FROM EMPLOYEES E, DEPARTMENTS D
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID; 

-- ANSI JOIN 문법 : 미국 표준협회에서 만든 모든 DBMS에서 사용가능한 문법

-- ANSI JOIN 문법 사용방법
-- SELECT  조회할 컬럼명
-- FROM 테이블1 (INNER) JOIN 테이블2
-- ON    (테이블1.컬럼 = 테이블2.컬럼) -->조인 조건
-- WHERE  일반 조건                  -->그외 다른 조건

-- 부서ID가 50인 직원만 출력

SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.SALARY, D.DEPARTMENT_NAME, E.DEPARTMENT_ID
FROM EMPLOYEES E JOIN DEPARTMENTS D
ON ( E.DEPARTMENT_ID = D.DEPARTMENT_ID )
WHERE E.DEPARTMENT_ID=50;

SELECT EMPLOYEE_ID, FIRST_NAME, SALARY, JOB_ID
FROM EMPLOYEEES;

SELECT *
FROM JOBS;

--직원ID, 이름, 급여, JOB_ID, JOB_TITLE의 정보를 출력
SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.SALARY, J.JOB_ID, J.JOB_TITLE
FROM EMPLOYEES E JOIN JOBS J
ON (E.JOB_ID = J.JOB_ID); 

SELECT 교육생정보.학생ID, 교육생정보.학생이름, 성적표.과목, 성적표.성적
FROM 교육생정보, 성적표 --357개의 행의 개수
WHERE 교육생정보.학생ID = 성적표.학생ID;
--조인 조건이 없으면 무조건 CROSS JOIN 이다


--카티션 곱이 발생 한다> 모든 경우의 수가 출력이 되는것

SELECT * FROM  교육생정보; --17개
SELECT * FROM 성적표; --21

-- 직원ID, 이름, 급여, JOB_ID, JOB_TITLE의 정보를 출력

-- 오라클 조인문법 : ,를 이용하고 WHERE 조건절에 조인 조건 작성
SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.SALARY, J.JOB_TITLE
FROM EMPLOYEES E, JOBS J
WHERE E.JOB_ID = J.JOB_ID
ORDER BY E.EMPLOYEE_ID ASC;

--ANSI JOIN 문법 : JOIN을 작성하고 ON 구에 조인 조건 작성
SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.SALARY, J.JOB_TITLE
FROM EMPLOYEES E JOIN JOBS J
ON (E.JOB_ID = J.JOB_ID)
ORDER BY E.EMPLOYEE_ID ASC;

-- OUTER JOIN : 외부조인이라고 하며, 두개의 테이블 간의 교집합을 조회하고 
-- 한쪽 테이블에만 있는 데이터도 포함시켜서 조회하고 싶을 때 사용하는 조인 문법
--> 한쪽 테이블의 NULL 값도 출력하고 싶을때 사용

SELECT * FROM DEPARTMENTS;
SELECT * FROM EMPLOYEES;

SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D, EMPLOYEES E
WHERE D.MANAGER_ID = E.EMPLOYEE_ID
ORDER BY D.DEPARTMENT_ID ASC;

-- LEFT OUTER JOIN
SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D LEFT OUTER JOIN EMPLOYEES E -- OUTER는 생략이 가능하다!
ON (D.MANAGER_ID = E.EMPLOYEE_ID)
ORDER BY D.DEPARTMENT_ID ASC;

--오라클 문법에서 LEFT OUTER JOIN
SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D , EMPLOYEES E -- OUTER는 생략이 가능하다!
WHERE D.MANAGER_ID = E.EMPLOYEE_ID(+)
ORDER BY D.DEPARTMENT_ID ASC;
--조인조건에서반대인 오른쪽 칼럼에 (+) 기호를 적어준다

-- RIGHT OUTER JOIN
SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D RIGHT OUTER JOIN EMPLOYEES E
ON (D.MANAGER_ID = E.EMPLOYEE_ID)
ORDER BY D.DEPARTMENT_ID ASC;

--오라클 문법에서 RIGHT OUTER JOIN 적용
SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D , EMPLOYEES E
WHERE D.MANAGER_ID(+) = E.EMPLOYEE_ID
ORDER BY D.DEPARTMENT_ID ASC;

-- FULL OUTER JOIN
SELECT D.DEPARTMENT_ID, D.DEPARTMENT_NAME, D.MANAGER_ID, E.FIRST_NAME
FROM DEPARTMENTS D RIGHT OUTER JOIN EMPLOYEES E
ON (D.MANAGER_ID = E.EMPLOYEE_ID)
ORDER BY D.DEPARTMENT_ID ASC;

-- 오라클 문법에서 FULL OUTER JOIN 지원안함

-- 직원ID가 105인 직원의 이름, 부서ID, 부서명을 조회.
SELECT E.EMPLOYEE_ID, E.FIRST_NAME, E.DEPARTMENT_ID, D.DEPARTMENT_ID
FROM EMPLOYEES E, DEPARTMENTS D
WHERE E.DEPARTMENT_ID = D.DEPARTMENT_ID
    AND E.EMPLOYEE_ID=105;




