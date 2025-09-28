package srhrd;

import java.util.Random;
import java.util.Scanner;

public class Ex06_실습 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		Random rd = new Random();
		
		int cnt = 0;
		
		while(true) {
		
		int num1 = rd.nextInt(10) + 1; // 1 ~ 10
		int num2 = rd.nextInt(10) + 1; // 1 ~ 10
		System.out.print(num1+ " + "  + num2 + "  = "  );
		int num = sc.nextInt();
		
		if(num == num1 + num2) {
			System.out.println("SUCCESS!");
		}else{
			System.out.println("Fail...");
			cnt++;
		}if(cnt==5) {
			System.out.println("GAME OVER");
		break;
		}
		}
		
		
		
		
		

	}

}
