package smhrd;

import java.util.Scanner;

public class Ex05_do_while문 {

	public static void main(String[] args) {
		
		
		Scanner sc = new Scanner(System.in);
		
		// 0을 누를 때까지 계속 숫자 입력하기
		
		
		do { 
			
			System.out.print(">");
			int num = sc.nextInt();
			
			
		}while(num != 0);
		
	
	}

}
