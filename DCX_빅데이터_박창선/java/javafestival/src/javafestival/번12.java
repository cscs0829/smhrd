package javafestival;

import java.util.Scanner;

public class 번12 {
public static void main(String[] args) {
	Scanner sc = new Scanner(System.in);
	
	System.out.println("정수를 입력해주세요 : ");
	int num1 = sc.nextInt();
	int num[][] = new int[num1][num1];
	int number = 1;
	
	for(int i =0; i<num.length; i++) {
		for(int j = 0; j<=num[i].length-1; j++) {
			num[i][j]= number;
			number++;
			
	}
	}
	
	for(int i =0; i<num.length; i++) {
		for(int j =0; j<num[i].length-1; j++) {
			System.out.print(num[j][i]);
		}
		System.out.println(" ");
	}
	
	
	
	
	
	
	
}
}
