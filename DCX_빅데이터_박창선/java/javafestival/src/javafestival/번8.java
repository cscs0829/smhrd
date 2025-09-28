package javafestival;

import java.util.Scanner;

public class 번8 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.println("숫자 입력 : ");
		int num = sc.nextInt();
		
		if(num%10>=5) {
			System.out.println(num+(10-(num%10))); 
		}else if(num%10<=5) {
			System.out.println((num-(num%10))); 
		}

	}

}
