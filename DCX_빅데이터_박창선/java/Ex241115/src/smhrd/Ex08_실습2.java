package smhrd;

import java.util.Scanner;

public class Ex08_실습2 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
	while(true) {
		System.out.println("첫번째 정수를 입력하세요");
		int num1 = sc.nextInt();
		
		System.out.println("두번째 정수를 입력하세요");
		int num2 = sc.nextInt();
		
		System.out.println("[1]더하기 [2]빼기");
		int choice = sc.nextInt();
		
		
		if(choice == 1) {
			System.out.println("더하기 연산 결과는 " + (num1+num2) +"입니다");
		}else if(choice == 2) {
			System.out.println("빼기 연산 결과는 " + (num1-num2) +"입니다");
		}
		
		System.out.println("다시 실행하시겠습니다? ");
		String result = sc.next();
		
		if(result.equals("N")) {
			System.out.println("프로그램 종료");
			break;
		}
	}
	}
}
