package smhrd;

import java.util.Scanner;

public class Ex21_season {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("몇월 인가요? : ");
		int sea = sc.nextInt();
		
		switch (sea) {
		case 12, 1, 2:
			System.out.println("겨울입니다");
			break;
		case 3, 4, 5:
			System.out.println("봄입니다");
			break;
		case 6, 7, 8:
			System.out.println("여름입니다");
			break;	
		case 9, 10, 11:
			System.out.println("가을입니다");
			break;
		default:
			System.out.println("다시 실행해주세요");
			break;
		}
		
		
		
		
		

	}

}
