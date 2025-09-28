-- 09.DCL 

-- DCL(DATA CONTROL LANGUAGE) : 데이터 제어어
--> 데이터 베이스에 접근하거나 객체에 권한을 주는 등의 역할을 하는 언어.

-- DCL의 명령어 종류
-- GRANT   :권한을 부여하는 명령어
-- REVOKE  :권한을 회수하는 명령어
-- ROLE    :권한을 묶어서 부여할때 사용하는 명령어

-- 사용자란?
--> 데이터베이스에 접속하여 데이터를 관리하는 계정을 사용자(USER) 라고 한다.

-- 사용자 생성하는 방법
-- CREATE USER (사용자 이름)
-- IDENTIFIED BY [비밀번호];

-- [ 시스템 권한 부여 방법 ]
-- GRANT [시스템 권한]  (필수)
-- TO [사용자 명]       (필수)
-- [WITH GRANT OPTION] (선택)
--> 부여받은 객체 권한을 다른 사용자에게 부여할 수 있는 권한도 함께 부여받는 것.

-- [시스템 권한 취소]
-- REVOKE [시스템권한] (필수)
-- FROM [사용자 명]    (필수) 
-- [CASCADE CONSTRAINT] (선택)
--> 해당 테이블과 관계가 있던 참조 제약조건에 대해서도 삭제를 하겠다 라는 의미



CREATE TABLE EMP (
    ENAME VARCHAR2(10)
);

-- ROLE 이란 
--> 여러 권한을 한번에 부여하기 위해 사용하는 것으로, 
-- 비슷한 종류의 권한끼리 모아서 한번에 권한을 묶어서 부여하는 것.

-- ROLE의 종류
-- CONNECT   : 데이터베이스에 접속에 필요한 권한
-- RESOURCE  : 테이블, 시퀀스 등의 객체를 생성하는 권한을 모아 놓음
-- DBA       : 데이터베이스를 관리하는 대부분의 시스템 권한

-- GRANT CONNECT, RESOURCE TO [사용자명] ;


-- [SQL 작성 순서(제일 중요)]
-- SELECT    조회할 컬럼 이름
-- FROM      조회할 테이블 정보
-- WHERE     원하는 행(데이터)를 선별하기 위한 조건 식
-- GROUP BY  특정 컬럼으로 그룹화
-- HAVING    그룹화 된 상태에서 조건식 
-- ORDER BY  특정 컬럼으로 정렬

-- *****[SQL 실행 순서]*****
-- FROM > WHERE > GROUP BY > HAVING > SELECT > ORDER BY


