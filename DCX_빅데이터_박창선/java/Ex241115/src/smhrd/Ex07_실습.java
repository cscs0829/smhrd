package smhrd;

import java.util.Scanner;

public class Ex07_실습 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		// 로그인 프로그램 
		// ID : "Hello"
		// PW : "1234"
		// answer : "Y" or "N"
		
		String id = "Hello";
		String pw = "1234";
		String answer;
	
		while(true) {
			
			// 아이디 입력받기 
			System.out.print("아이디를 입력해주세요 >> ");
			String user_id = sc.next();
			
			// 비밀번호 입력받기
			System.out.print("비밀번호를 입력해주세요 >> ");
			String user_pw = sc.next();
			
			if(id.equals(user_id) && pw.equals(user_pw)) {
				//로그인 성공
				System.out.println("로그인 성공!!");
				break;
			}else {
				//로그인 실패
				System.out.print("계속 하시겠습니까? (Y/N) >> ");
				answer = sc.next();
				
				if(answer.equals("N")) {
					System.out.println("종료되었습니다");
					break;
				}
				
			}
			
			
			
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}

}
