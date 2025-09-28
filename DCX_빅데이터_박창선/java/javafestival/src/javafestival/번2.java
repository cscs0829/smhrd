package javafestival;

import java.util.Scanner;

public class 번2 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		System.out.println("일한 시간을 입력하세요 : ");
		int num = sc.nextInt();
		int sum = 0;
		for(int i= 1; i <=num; i++)
		
		if(i<=8) {
			sum =i*5000;
			
		}else if(num>8) {
			sum = (i*7500)-20000;
		}System.out.println("총 임금은 " + sum);

	}

}
