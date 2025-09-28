package smhrd;

import java.util.Scanner;

public class Ex06_do_while문 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // 초기 몸무게와 목표 몸무게 설정
        System.out.print("현재 몸무게를 입력하세요: ");
        int pw = sc.nextInt(); // 현재 몸무게
        System.out.print("목표 몸무게를 입력하세요: ");
        int gw = sc.nextInt(); // 목표 몸무게
        
        int num = 1; // 몇 주차를 카운트할 변수
        int w = 0;  // 주차별 감량 몸무게
        
        // 목표 몸무게 달성할 때까지 반복
        do {
            System.out.print(num + "주차 감량 몸무게 : ");
            w = sc.nextInt();  // 감량된 몸무게 입력
            
            pw -= w;  // 현재 몸무게에서 감량된 몸무게를 빼기
            
            
            
            
            
        } while (pw > gw);  // 현재 몸무게가 목표보다 클 때까지 반복
        System.out.println(pw + "kg을 달성!! 축하합니다!");
    
    }
}
