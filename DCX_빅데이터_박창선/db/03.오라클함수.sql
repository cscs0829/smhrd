-- CHAPTER 03. 오라클함수 --

-- 함수(FUNCTION) ?
--> 입력 값을 넣어서 특정한 기능을 통해서 결과 값을 출력

-- 사용자 정의함수 : 사용자가 필요에 의해 직접 정의한 함수
-- 내장 함수 : 오라클에서 미리 만들어 놓은 함수, 필요할 때마다 호출해서 사용한다.
-- 내장함수는 문자형, 숫자형, 날짜형, 변환형, NULL처리함수, 조건함수

-- 함수이름() : 함수를 실행할때 사용하는 입력 값 -> 매개변수, 인자값

-- [문자형 함수]
-- UPPER() : 괄호 안 문자 데이터를 모두 대문자로 변환하여 출력
-- LOWER() : 괄호 안 문자 데이터를 모두 소문자로 변환하여 출력

SELECT 'abcde123@', UPPER('abcde123@@')
FROM DUAL;

--DUAL 테이블이란?
--> 오라클 최고관리자 (SYSTEM) 소유의 테이블
--> 임시 연산이나 함수의 결과 값 확인 용도로 사용하는 테스트용 테이블이다.

SELECT * FROM EMPLOYEES;

-- 직원의 FIRST_NAME을 모두 대문자로, 이메일 정보를 모두 소문자로 바꿔서 출력.

SELECT UPPER(FIRST_NAME), LOWER(EMAIL)
FROM EMPLOYEES;

--LENGTH() : 괄호 안 문자 데이터의 길이를 구하는 함수이다.
SELECT 'HELLO WORLD', LENGTH('HELLO WORLD')
FROM DUAL;

--직원의 이름 출력하고 그 이름의 길이도 옆에 출력을 해주세요.

SELECT FIRST_NAME, LENGTH(FIRST_NAME)
FROM EMPLOYEES;

--직원의 이름의 길이가 5인 이상의 직원의 직원 아이디 이름을 출력을 해주시오.
SELECT FIRST_NAME, LENGTH(FIRST_NAME)
FROM EMPLOYEES
WHERE LENGTH(FIRST_NAME) >= 5;

-- SUBSTR() : 문자열을 추출하는 함수
-- 1) SUBSTR(입력 값, 시작위치, 추출길이)
--> 문자열 데이터의 시작위치부터 추출 길이만큼 출력
-- 2) SUBSTR(입력 값, 시작위치)
--> 추출길이를 생략시 문자열 데이터의 시작위치부터 끝까지 출력



SELECT '빅데이터 분석서비스 개발자 과정'
        , SUBSTR('빅데이터 분석서비스 개발자 과정', 1, 4)
        , SUBSTR('빅데이터 분석서비스 개발자 과정', 8, 3)
        , SUBSTR('빅데이터 분석서비스 개발자 과정', 12, 3)
        , SUBSTR('빅데이터 분석서비스 개발자 과정',2)
    FROM DUAL ;
    
SELECT HIRE_DATE FROM EMPLOYEES;

--직원의 입사날짜에서 연도 월 일 별로 출력
--단 각 컬럼에는 연도, 월, 일 별로 별칭을 사용해서 출력.

SELECT HIRE_DATE
        ,SUBSTR(HIRE_DATE, 1,2) AS 연도
        ,SUBSTR(HIRE_DATE, 4,2) AS 월
        ,SUBSTR(HIRE_DATE, 7,2) AS 일
FROM EMPLOYEES;

--REPLACE() : 특정 문자를 다른 문자로 바꾸어 주는 함수
--1) REPLACE(문자열데이터, 바꾸고 싶은 문자, 바꿔야 할 문자)
--2) REPLACE(문자열데이터, 바꾸고 싶은 문자)
--> 바꿔야 할 문자를 생략시 바꾸고 싶은 문자는 문자열 데이터에서 삭제가 됩니다.


SELECT '스마트#인재개발원'
, REPLACE('스마트#인재개발원', '#', '_')
, REPLACE('스마트#인재개발원', '#') 
FROM DUAL;

SELECT HIRE_DATE FROM EMPLOYEES;

-- 직원의 입사날짜에서 슬러시를(/) -(하이픈)으로 바꿔서 출력
SELECT REPLACE (HIRE_DATE, '/', '-')
FROM EMPLOYEES;
-- 슬러시를(/) 삭제하여 출력

SELECT REPLACE (HIRE_DATE, '/', '_')
FROM EMPLOYEES;

-- [숫자형 함수]
-- ROUND() : 특정 위치에서 반올림 하는 함수 
-- 1) ROUND(반올림 할 숫자, 반올림 위치)
-- 2) ROUND(반올림 할 숫자)
--> 반올림 위치 생략시 소수점 첫째 자리에서 강제로 반올림 수행 됨

SELECT 1234.56789
    , ROUND(1234.56789, 1)
    , ROUND(1234.56789, 3)
    , ROUND(1234.56789)
FROM DUAL;

-- MOD() : 숫자를 나눈 나머지 값을 구하는 함수
--> 홀수, 짝수 를 구분할 때 유용하게 사용한다.
-- MOD(나눈 후 나머지, 나눌 숫자)

SELECT MOD(10,2)
    , MOD(10,3)
    , MOD(15,6)
    
FROM DUAL;

--[ 날짜형 함수 ]
-- SYSDATE : 현재 날짜와 시간을 출력해주느 함수 
-- 입력시 바로 출력이 되며, 현재 시간을 초단위까지 출력이 가능하다.
--> 날짜형 데이터는 연산이 가능하다.
--> 날짜형 데이터끼리는 연산이 불가능하다.


SELECT SYSDATE
    , SYSDATE + 1 AS 내일
    , SYSDATE - 1 AS 어제
--    , SYSDATE + SYSDATE --> 날짜 데이터끼리는 연산이 불가능하다.
-- 도구 > 환경설정 > 데이터베이스 > NLS > 날짜형식 > YYYY-MM-DD
FROM DUAL;

--날짜데이터의 활용(실무)
SELECT SYSDATE AS 현재
    ,SYSDATE +1 AS "하루를 더함"
    ,SYSDATE +1/24 AS "한시간 더함"
    ,SYSDATE +1/24/60 AS "일분 더함"
    ,SYSDATE +1/24/60/60 AS "일초 더함"
FROM DUAL;

-- ADD_MONTHS() : 몇개월 이후 날짜를 구하는 함수
-- ADD_MONTHS(날짜데이터, 더하거나 뺄 개월 수)

SELECT SYSDATE AS 현재
, ADD_MONTHS(SYSDATE, +3)
, ADD_MONTHS(SYSDATE, -1)
FROM DUAL ; 

-- [ 변환 형 함수 ]
-- 형변환 형태의 종류 
-- 암시적 형변환 : 데이터베이스가 자동으로 형변환을 해주는것.
SELECT '1000' + 500
FROM DUAL;

SELECT SALARY * '12'
FROM EMPLOYEES;

-- 명시적 형변환 : 데이터 변환 형 함수를 사용해서 사용자가 직접 자료형을 지정 해주는 것 

-- TO_CHAR() : 날짜, 숫자 데이터를 문자 데이터로 변환 해주는 함수
-- TO_CHAR(변환할 데이터, 출력형태)

SELECT SALARY, TO_CHAR(SALARY,'L999999')
    FROM EMPLOYEES;

-- TO_NUMBER() : 문자 데이터를 숫자 데이터로 변환하는 함수
-- TO_NUMBER(문자열 데이터, 인식 될 숫자 형태)

SELECT TO_NUMBER('1,000','999,999') + 500
    FROM DUAL ;
    
-- TO_DATE() : 문자 데이터를 날짜 데이터로 변환하는 함수
-- TO_DATE(문자열데이터, 인식될 날짜 형태)

SELECT TO_DATE('20241122', 'YYYY-MM-DD')
    FROM DUAL;

--[ NULL 처리 함수 ] 

-- NVL() / NVL2() : NULL값을 대체 할 수 있는 함수
-- 1) NVL(NULL인지 여부를 검사할 데이터, NULL일 경우 반환할 데이터)
-- 2) NVL2(NULL인지 여부를 검사할 데이터, NULL이 아닐경우 반환할 데이터, NULL일 경우 반환할 데이터)

SELECT FIRST_NAME, COMMISSION_PCT FROM EMPLOYEES;

SELECT FIRST_NAME, COMMISSION_PCT
    , NVL2(COMMISSION_PCT, 1, 0)
    , NVL(COMMISSION_PCT, 0)
    FROM EMPLOYEES;
    
-- 직원테이블에서 직원ID, FIRST_NAME, 매니저ID를 출력,
-- 매니저가 있는 직원은 '직원'으로 출력
-- 매니저가 없는 직원은 '대표'로 출력
SELECT EMPLOYEE_ID, FIRST_NAME, MANAGER_ID
    , NVL2(MANAGER_ID, '직원', '대표')
    FROM EMPLOYEES;

-- 부서아이디가 없는 직원의 부서아이디를 200으로 변경하여 출력
SELECT DEPARTMENT_ID ,FIRST_NAME
    , NVL(DEPARTMENT_ID, 200)
    FROM EMPLOYEES
WHERE FIRST_NAME = 'Kimberely';

--[ 조건 함수 ] -- DECODE
-- DECODE() : 상황에 따라 다른 데이터를 반환하는 함수
--> 검사대상과 비교해서 지정한 값을 반환.

-- DECODE(검사대상이 될 컬럼 또는 데이터<기준>, 비교값, 일치시 반환할 값, 일치하지 않을때 반환값<마지막>)

--직원테이블에서 매니저가 있는 직원은 '직원'으로 출력,
--매니저가 없는 직원은 '대표'로 출력

--추가문제) EMPLOYEE_ID 가 101인 직원을 전무이사로 대체하여 출력.
-- EMPLOYEE_ID가 102인 직원은 상무이사로 대체해서 출력.
-- EMPLOYEE_ID가 103DLS 직원은 팀장으로 대체해서 출력.

SELECT EMPLOYEE_ID, FIRST_NAME, MANAGER_ID
    , DECODE(MANAGER_ID, NULL, '대표', 
    DECODE(EMPLOYEE_ID,101, '전무이사', 
    DECODE(EMPLOYEE_ID,102, '상무이사', 
    DECODE(EMPLOYEE_ID,103, '팀장', '직원'))))
    FROM EMPLOYEES;



--