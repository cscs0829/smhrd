package smhrd;

import java.util.Scanner;

public class Ex14_else_if {

	public static void main(String[] args) {
		
		
		// int 타입의 age 라는 변수를 입력 받고
		// 10보다 크거나 같고 20보다 작으면 - 10대입니다 출력
		// 20보다 크거나 같고 30보다 작으면 - 20대입니다 출력
		// ... 40대 까지 
	
		Scanner sc = new Scanner(System.in);
		
		System.out.print("나이를 입력하세요 : ");
		int age = sc.nextInt();
		
		if(age >= 10 && age <20 ) {
			System.out.println("10대 입니다");
		// 조건식을 주기 하고 싶은경우
			//else if (조건식)
		}else if(age <30) {
			System.out.println("20대 입니다.");
		}else if(age <40) {
			System.out.println("30대 입니다.");
		}else if(age <50) {
			System.out.println("40대 입니다.");
		}else if(age <60) {
			System.out.println("50대 입니다.");
		}else if(age <70) {
			System.out.println("60대 입니다.");
		}else if(age <80) {
			System.out.println("70대 입니다.");
		}else if(age <90) {
			System.out.println("80대 입니다.");
		}else {
			System.out.println("잘못 입력 했습니다");
			
		}
		
		
		
		
		
		
		
	}

}
