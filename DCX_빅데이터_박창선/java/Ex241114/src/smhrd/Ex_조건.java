package smhrd;

import java.util.Scanner;

public class Ex_조건 {
	public static void main(String[] args) {
		
		// 조선연산자(삼항연산자)
		// (조건문) ? (실행문1) : (실행문2)
		// 실행문1 : 조건식이 참(True)일 때 실행
		// 실행문2 : 조건식이 false일 때 실행
		
		// 두 정수를 입력 받아(Scanner)
		// num1, num2에 저장 
		// num1이 num2보다 크다면 true 출력
		// num1이 num2보다 작거나 같다면 false 출력
		
		Scanner sc= new Scanner(System.in);
		
		System.out.print("num1 : ");
		int num1 = sc.nextInt();
		System.out.print("num2 : ");
		int num2 = sc.nextInt();
		
		System.out.println( num1>num2 ? true : false);
		
		
		
		
		
		
		
}
}
