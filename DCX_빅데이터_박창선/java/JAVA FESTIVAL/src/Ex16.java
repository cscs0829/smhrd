import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // 8자리 정수를 입력받음
        System.out.print("8자리 정수를 입력하세요: ");
        int number = scanner.nextInt();

        // 입력값 유효성 검사 (8자리 정수 확인)
        if (number < 10000000 || number > 99999999) {
            System.out.println("올바른 8자리 정수를 입력하세요.");
        } else {
            int sum = 0;

            // 자리수 합 계산 (for 반복문)
            for (; number > 0; number /= 10) {
                sum += number % 10;  // 마지막 자리 숫자를 더함
            }

            // 결과 출력
            System.out.println("입력받은 정수의 자리수 합: " + sum);
        }

        scanner.close();
    }
}
