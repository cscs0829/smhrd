package smhrd;

import java.util.Scanner;

public class Ex13_if_else {

	public static void main(String[] args) {
		
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("정수 입력 : ");
		int num1 = sc.nextInt();
		
		//짝수 2로 나누어서 나머지가 0
		if(num1 % 2 == 0) {
			
			System.out.print(num1+"은(는) 짝수 입니다.");
		}else {  
			System.out.print(num1+"은(는) 홀수 입니다.");
		}
		
		System.out.print("안녕");
	
		
		
		
		
		
	}

}
