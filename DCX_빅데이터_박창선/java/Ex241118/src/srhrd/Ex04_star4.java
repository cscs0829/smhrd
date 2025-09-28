package srhrd;

import java.util.Scanner;

public class Ex04_star4 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);

		System.out.print("원하는 별찍기 개수 입력 : ");
		int num = sc.nextInt();
		
		
		for(int j = 1  ; j <= num; j++) {
			for(int i = num; i>j; i--) {
				System.out.print(" ");
				
			}for(int g =0; g<j; g++) {
				System.out.print("*");
			}
			
			System.out.println();
		}
	}

}
