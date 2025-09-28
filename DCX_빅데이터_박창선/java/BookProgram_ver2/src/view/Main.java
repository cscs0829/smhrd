package view;

import java.util.Scanner;

import model.BookDAO;
import model.BookDTO;

public class Main {

	public static void main(String[] args) {

		
		
		Scanner sc = new Scanner(System.in);
//		BookCon mc = new BookCon();
		BookDAO dao = new BookDAO();
		
		while(true) {
			System.out.print("[1]책 목록보기 [2]책 빌리기 [3]종료 >> ");
			int menu = sc.nextInt();
			
			if(menu == 1) {
				// 책 목록보기
				dao.bookList();
				
			}else if(menu == 2) {
				// 책 빌리기
				// 빌리는 사용자의 아이디 값 입력받기
				System.out.print("대여자 아이디 : ");
				String id = sc.next();
				// 빌리고 싶은 책의 번호 입력받기
				System.out.print("대여할 책 번호 : ");
				int book_num = sc.nextInt();
				
				// 대여할 책 번호에 해당하는 book_name값 가져오기
				// MEMBER테이블에서 아이디에 해당하는 book_name컬럼에 책이름 저장하기
				BookDTO dto = dao.borrowBook(id, book_num);
				
				if(dto != null) {
					while(true) {
						System.out.print("[1]책 목록보기 [2]내가 책장 보기 [3]책 반납하기 >> ");
						menu = sc.nextInt();
						
						if(menu == 1) {
							dao.bookList();
						}else if(menu == 2){
							dao.memberBook(id);
						}else{
							dao.returnBook(dto);
							break;
						}
						
					}
					
				}else {
					System.out.println("해당하는 책은 없는 책입니다.");
					break;
				}
				
				
				
				
			}else if(menu == 4) {
				// 종료 기능
				System.out.println("프로그램 종료!");
				break;
			}else{
				System.out.println("번호를 다시 골라주세요!");
			}
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
	}

}
