package smhrd;

import java.util.Scanner;

public class Ex02_while문 {

    public static void main(String[] args) {
        
        // 정수를 계속 입력받기 
        // 입력받은 정수를 하나의 변수에 계속 누적
        // 반복문을 탈출하는 조건 : -1을 입력했을 때 
        
        Scanner sc = new Scanner(System.in);
        
        int sum = 0;
        
        while(true) {
            
            System.out.print("숫자 입력 : ");
            int num = sc.nextInt();
            
            sum += num;  // sum 변수에 num을 누적
            System.out.println("누적 결과 : " + sum);
            
            if(num == -1) {
                System.out.println("종료되었습니다");
                break;
            }
            
        }
        
        
    }
}
