package smhrd;

import java.util.Scanner;

public class Ex03_while문 {
	public static void main(String[] args) {
	
		Scanner sc = new Scanner(System.in);
		
		int odd = 0;
		
		int even = 0;
		
		
		while(true) {
            
            System.out.print("숫자 입력 : ");
            int num = sc.nextInt();
            
            if(num%2==0) {
            	even++;
            	
            	
            }else if(num%2==1) {
            	odd++;
            }else if(num==-1) {
            	System.out.println("종료합니다");
            break;
            }
            System.out.println("짝수 개수 :"+ even );
            System.out.println("홀수 개수 :"+ odd);
		}
		
}
}
