DROP TABLE 교육생정보 ; 
DROP TABLE 성적표 ; 

CREATE TABLE 교육생정보 (
학생ID VARCHAR2(9) PRIMARY KEY , 
학생이름 VARCHAR2(50) NOT NULL , 
팀 VARCHAR2(5) 
); 

CREATE TABLE 성적표 ( 
    학생ID VARCHAR2(9) , 
    과목   VARCHAR2(30) , 
    성적   NUMBER  , 
    CONSTRAINT PK_성적표 PRIMARY KEY(학생ID , 과목) , 
    CONSTRAINT FK_성적표 FOREIGN KEY(학생ID) REFERENCES 교육생정보(학생ID) 
)  ;
INSERT INTO 교육생정보 VALUES ('SMHRD1' , '박수현' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD2' , '박지승' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD3' , '김중진' , 'A') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD4' , '강은혜' , 'B') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD5' , '이수정' , 'B') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD6' , '김승화' , 'B') ; 
INSERT INTO 교육생정보 VALUES ('SMHRD7' , '강승표' , 'B') ;
INSERT INTO 성적표 VALUES('SMHRD1'  ,'JAVA' , 90); 
INSERT INTO 성적표 VALUES('SMHRD1'  ,'DATABASE' , 85); 
INSERT INTO 성적표 VALUES('SMHRD1'  ,'PYTHON' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD2'  ,'PYTHON' , 20); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD3'  ,'PYTHON' , 20); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'JAVA' , 85); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'DATABASE' , 40); 
INSERT INTO 성적표 VALUES('SMHRD4'  ,'PYTHON' , 60); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'JAVA' , 100); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'DATABASE' , 100); 
INSERT INTO 성적표 VALUES('SMHRD5'  ,'PYTHON' , 100);
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'JAVA' , NULL ) ; 
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'DATABASE' , NULL ) ; 
INSERT INTO 성적표 VALUES ( 'SMHRD6' , 'PYTHON' , NULL ) ; 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'JAVA' , 80); 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'DATABASE' , 90); 
INSERT INTO 성적표 VALUES('SMHRD7'  ,'PYTHON' , 100);


SELECT 학생ID,
    ROUND(AVG(성적),1) AS 평균점수 
FROM 성적표
GROUP BY 학생ID
ORDER BY 1;

-- 과목별로 최고 성적과 최저 성적을 출력.
SELECT MAX(성적)
    ,MIN(성적)
FROM 성적표
GROUP BY 과목;

-- 각 팀에 몇명의 학생이 있는지 출력 
SELECT 팀, count(학생ID)
FROM 교육생정보
GROUP BY 학생ID, 팀;


-- 학생별로 JAVA와 DB성적의 평균을 출력, 1의 자리까지
SELECT 학생ID, 
       ROUND(AVG(성적), 1)
       
FROM 성적표
WHERE 과목 != 'PYTHON'
GROUP BY 학생ID
ORDER BY 1;





