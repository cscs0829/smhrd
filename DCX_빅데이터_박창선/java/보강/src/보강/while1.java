package 보강;

import java.util.Scanner;

public class while1 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		int num1 = 0;
		int num2 = 0;
		
		while(true) {
			
			System.out.print("숫자 입력 : ");
			int num = sc.nextInt();
			
			if(num%2==0) {
				num1++;
				
			}else if(num%2==1) {
				num2++;
				
			}else if(num==-1) {
				System.out.println("종료되었습니다");
				break;
			}
			System.out.println("짝수 개수 : " + num1);
			System.out.println("홀수 개수 : " + num2);
		}
		

	}

}
