package view;

import java.util.Scanner;
import controller.bookcon;

public class BookMain {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        bookcon controller = new bookcon(); // BookCon 객체 생성

        while (true) {
            System.out.println("[1] 책목록 [2] 책 빌리기 [3] 책 반납하기 [4] 종료 >> ");
            int menu = sc.nextInt();

            if (menu == 1) {
                // 책 목록 출력
                controller.showBookList();

            } else if (menu == 2) {
                // 책 대여
                System.out.println("대여할 책 번호를 입력하세요: ");
                int book_num = sc.nextInt();
                boolean success = controller.rentBook(book_num);
                if (!success) {
                    System.out.println("책 대여에 실패했습니다. 다시 시도해주세요.");
                }

            } else if (menu == 3) {
                // 책 반납
                System.out.println("반납할 책 번호를 입력하세요: ");
                int book_num = sc.nextInt();
                boolean success = controller.returnBook(book_num);
                if (!success) {
                    System.out.println("책 반납에 실패했습니다. 다시 시도해주세요.");
                }

            } else if (menu == 4) {
                // 종료
                System.out.println("프로그램 종료~!");
                break;

            } else {
                System.out.println("번호를 다시 선택해주세요!");
            }
        }

        sc.close();
    }
}
