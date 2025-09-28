package smhrd;

import java.util.Scanner;

public class Ex11_for {

    public static void main(String[] args) {
        
        Scanner sc = new Scanner(System.in);
        
        System.out.print("첫 번째 정수 : ");
        int num1 = sc.nextInt();
        System.out.print("두 번째 정수 : ");
        int num2 = sc.nextInt();
        
        int sum = 0;
        
        for (int i = num1; i <= num2; i++) {
        
        	sum += i; 
            
        }System.out.print(sum);

        
        
        
        
        
        
        
        
        
        //for문도 무한 반복문 생성
//        for(;;) {
//        	
//        }
    }
}