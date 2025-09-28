package srhrd;

import java.security.DrbgParameters.NextBytes;
import java.util.Scanner;

public class Ex03_star3 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		
		
		for(int j =0; j <= 6; j++) {
			for(int i = 5; i>j; i--) {
				System.out.print("*");
				
			}
			System.out.println();
		}

	}

}
