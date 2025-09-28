package smhrd;

import java.util.Scanner;

public class Ex00_switch_복습 {

    public static void main(String[] args) {

        // 가위바위보 프로그램 만들기

        Scanner sc = new Scanner(System.in);

        System.out.print("USER1 : ");
        String user1 = sc.next();

        System.out.print("USER2 : ");
        String user2 = sc.next();

        System.out.println(user1 + "님 >> ");
        String rsp1 = sc.next();

        System.out.println(user2 + "님 >> ");
        String rsp2 = sc.next();

        // user1, user2 가 낸 가위 바위 보를 순서대로 붙이기
        String rsp = rsp1 + rsp2; // rsp1 = "바위" rsp2 = "가위" -> rsp = "바위가위"

        switch (rsp) {
            // 무승부일 경우
            case "가위가위":
            case "바위바위":
            case "보보":
                System.out.println("무승부");
                break;
            // user1이 승리할 경우
            case "가위보":
            case "바위가위":
            case "보바위":
                System.out.println(user1 + "님 승리!");
                break;
            // user2가 승리할 경우
            case "가위바위":
            case "바위보":
            case "보가위":
                System.out.println(user2 + "님 승리!");
                break;
            default:
                System.out.println("잘못 입력하셨습니다~~");
        }

    }

}
