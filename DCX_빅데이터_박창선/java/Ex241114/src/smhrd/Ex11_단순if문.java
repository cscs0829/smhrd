package smhrd;

import java.util.Scanner;

public class Ex11_단순if문 {
	public static void main(String[] args) {
	
		// 단순 if문 구조
		// if (조건식) { -> 조건식은 true or false 값을 가져야 함
		//	조건식이 true일 때 실행문
		//
		// } false 일 때 if문 탈출
		
		// 정수데이터 타입 num을 입력받고 
		// 조건식 : num이 10보다 크다면 ~
		// 조건식이 true일 때 : "10보다 큽니다." 출력
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("정수 입력 :");
		int num = sc.nextInt();
			
		if(num > 10) {
			System.out.println("10보다 큽니다~");
		}
		System.out.println("10보다 작습니다~");
		
		
		
		
		
		
		
		
}
}
