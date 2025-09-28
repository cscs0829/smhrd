package smhrd;

import java.util.Scanner;

public class Ex16_score {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.print("점수를 입력해 주세요 : ");
		int grade = sc.nextInt();
		
		if(grade >= 90) {
			System.out.print("A학점");
		} else if(grade >= 80) {
			System.out.print("B학점");
		} else if(grade >= 70) {
			System.out.print("C학점");
		} else{
			System.out.print("재수강");
		}
			
		// 비교연산자 == 
		// == 값이 같은가 같지 않는가 --> 기본타입에만 적용
		
		

	}

}
