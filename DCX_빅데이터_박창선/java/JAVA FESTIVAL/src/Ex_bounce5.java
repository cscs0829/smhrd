import java.util.Scanner;

public class Ex_bounce5 {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // 크기 5인 정수 배열 생성
        int[] arr = new int[5];
        for (int i = 0; i < arr.length; i++) {
            System.out.print((i + 1) + "번째 수 입력 : ");
            arr[i] = sc.nextInt();
        }

        // 버블 정렬 (오름차순)
        for (int k = 1; k < arr.length; k++) {
            for (int j = 0; j < arr.length - k; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }

        // 정렬 결과 출력
        System.out.println("정렬 후:");
        for (int i = 0; i < arr.length; i++) { // 반복 변수 i 선언 추가
            System.out.print(arr[i] + " ");
        }
    }
}
