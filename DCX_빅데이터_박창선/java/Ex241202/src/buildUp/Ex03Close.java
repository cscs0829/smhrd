package buildUp;

import java.util.Scanner;

public class Ex03Close {

	public static void main(String[] args) {
		
		// while문 
		// 무한 반복
		// -1을 입력하면 while문 탈출
		
		Scanner sc = new Scanner(System.in);
		
		
		
		while(true) {
			
		System.out.println("달러 입력 : ");
		int dollar = sc.nextInt();
		if(dollar == -1) {
			break;
		}else {
			System.out.println(dollar * 1400 + "원 입니다.");
		}
		}
		sc.close();
	}

}
