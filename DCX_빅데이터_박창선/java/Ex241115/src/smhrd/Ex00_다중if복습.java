package smhrd;

import java.util.Scanner;

public class Ex00_다중if복습 {

	public static void main(String[] args) {

		Scanner sc = new Scanner(System.in);

		System.out.print("USER1 : ");
		String user1 = sc.next();

		System.out.print("USER2 : ");
		String user2 = sc.next();

		System.out.println(user1 + "님 >> ");
		String rsp1 = sc.next();

		System.out.println(user2 + "님 >> ");
		String rsp2 = sc.next();
		
		if(rsp1.equals(rsp2)) {
			//무승부일 때
			System.out.println("무승부!!");
		
		
		} else if(rsp1.equals("가위")) {
			
			if(rsp2.equals("바위")) {
				System.out.println(user2 + "님 승리");
			}else {
				System.out.println(user1 + "님 승리");
			}
		
		
		} else if(rsp1.equals("바위")) {
			
			if(rsp2.equals("보")) {
				System.out.println(user2 + "님 승리");
			}else {
				System.out.println(user1 + "님 승리");
			}
		
		
		} else if(rsp1.equals("보")) {
			
			if(rsp2.equals("가위")) {
				System.out.print(user2 + "님 승리");
			}else {
				System.out.print(user1 + "님 승리");
			}
			}else {
				System.out.println("잘못 입력하셨습니다!");
		}
	}

}
