package smhrd;

import java.util.Scanner;

public class Ex20_switch {
	public static void main(String[] args) {
		
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("아이디를 입력하세요 : ");
		String id = sc.next();
		
		switch (id) {
		case "dnjsgh":
			System.out.println("환영합니다.");
			break;

		default:
			break;
		}
		
		
		
		
		
		
	}

}
