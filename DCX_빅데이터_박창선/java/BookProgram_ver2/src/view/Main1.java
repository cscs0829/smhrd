package view;

import java.util.Scanner;

import model.BookDAO;
import model.BookDAO1;
import model.BookDTO;
import model.BookDTO1;

public class Main1 {

	public static void main(String[] args) {
		
		
		Scanner sc = new Scanner(System.in);
		BookDAO1 dao = new BookDAO1();
		
		while(true) {
			System.out.print("[1]책 목록보기 [2]책 빌리기 [3] 종료 >> ");
			int menu = sc.nextInt();
			
			if(menu == 1) {
				// 책 목록보기
				dao.bookList();
				
			}else if(menu ==2) {
				
				System.out.println("대여자 아이디 : ");
				String id = sc.next();
				//빌리고 싶은 책의 번호 입력받기 
				System.out.println("대여할 책 번호 : ");
				int book_num = sc.nextInt();
				
				//대여할 책 번호에 해당하는 book_name값 가져오기
				//member테이블에서 아이디에 해당하는 book_name컬럼에 책 이름 저장하기
				BookDTO1 dto = dao.borrowBook(id, book_num);
				
				
				
				
				
				
			}
		
		}
		
		
		
		
		
		
	}

}
