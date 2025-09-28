package smhrd;

import java.util.Scanner;

public class Ex18_switch {

	public static void main(String[] args) {
		
		// age를 입력 받아 20살 이상이면 성인
		
		Scanner sc = new Scanner(System.in);
		
		//짝수, 홀수 구하기
		System.out.print("정수 입력 : ");
		int num1 = sc.nextInt();
		
		switch (num1 %2) {
		case 0:
			System.out.println("짝수 입니다.");
			//break;
			//1. case문을 멈추는 키워드
			break;
			
//		case 1:
//			System.out.println("홀수 입니다.");
//			break;
			
		default:
			//if문의 else 기능
			System.out.println("홀수 입니다.");
			//2. default문을 멈추는 키워드
			break;
		}
		
		
		
		
		
//		System.out.print("나이 : ");
//		int age = sc.nextInt();
//		
//		switch (age) {
//		
//		case 20:
//			System.out.println("성인입니다.");
//			break;
//
//		default:
//			break;
//		}
		
		
	}

}
