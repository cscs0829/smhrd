package smhrd;

import java.util.Scanner;

public class Ex01_while문 {

	public static void main(String[] args) {
		
		
		Scanner sc = new Scanner(System.in);
		
		// while(조건식){
		// 조건식이 true일 때 실행문
		//}
		
		while(true) {
			
			System.out.print("숫자 입력 : ");
			int num = sc.nextInt();
			
			if(num > 10) {
				System.out.println("종료되었습니다");
				break;
			}
			
			
		}
		

		
		
		
		
	}

}
