package javafestival;

import java.util.Scanner;

public class 번19 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.println("단수 입력 : ");
		int num = sc.nextInt();
		
		System.out.println("어느 수까지 출력 : ");
		int num1 = sc.nextInt();
		
		System.out.println(num + "단");
		for(int i = 1; i<=num1; i++) {
			System.out.println(num + "*" + i + "=" + (num*i));
			
		}
		
		
		
		
		
		
	}

}
