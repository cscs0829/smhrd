create table book(
	book_num number,
	book_name varchar(50),
	book_writer varchar(50),
	book_price varchar(100),
	primary key(book_num)
);

create sequence num_seq
increment by 1
start with 1;

insert into BOOK values(num_seq.nextval, '소년이 온다', '한강', '13,500');
insert into BOOK values(num_seq.nextval, '트렌드 코리아 2025', '김난도', '18,000');
insert into BOOK values(num_seq.nextval, '일의 감각', '조수용', '19,000');
insert into BOOK values(num_seq.nextval, '넥서스', '유발 하리라', '25,050');

INSERT INTO MEMBER(BOOK_NAME) VALUES(?) WHERE ID=?

select * from book;
INSERT INTO MEMBER(BOOK_NAME) VALUES('소년이 온다') WHERE ID='juhee';
UPDATE MEMBER SET BOOK_NAME='0000' WHERE ID='juhee';

SELECT * FROM BOOK WHERE BOOK_NUM=2;
ALTER TABLE member ADD book_name VARCHAR(50) DEFAULT '-';
select * from member;

drop table book;
drop sequence num_seq;