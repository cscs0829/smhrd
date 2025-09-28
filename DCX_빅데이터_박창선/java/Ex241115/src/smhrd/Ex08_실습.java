package smhrd;

import java.util.Scanner;

public class Ex08_실습 {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        String answer;  
        
        while(true) {  
            System.out.print("첫 번째 정수를 입력하세요 >> ");
            int num1 = sc.nextInt(); 
            System.out.print("두 번째 정수를 입력하세요 >> ");
            int num2 = sc.nextInt();  
            
            System.out.print("[1] 더하기 [2] 빼기 >>");
            int operation = sc.nextInt();  
            
            if(operation == 1) {
                System.out.println("더하기 연산 결과는 " + (num1 + num2) + "입니다.");
            } else if(operation == 2) {
                System.out.println("빼기 연산 결과는 " + (num1 - num2) + "입니다.");
            } else {
                System.out.println("잘못된 선택입니다.");
            }
            
          
            System.out.print("계속 하시겠습니까? (Y/N) >> ");
            answer = sc.next();
            
            for(int cnt = 0; cnt <= 5; cnt++) {
    			
    			System.out.println("GAME OVER");
    		}break;
            
        }
        
       
    }
}
