import java.util.Scanner;

public class Ex24 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);

		System.out.print("N 입력 >> ");
		int n = sc.nextInt();

		System.out.print("X 입력 >> ");
		int x = sc.nextInt();

		int[] arr = new int[n];

		for (int i = 0; i < n; i++) {
			System.out.print(i + 1 + "번째 정수 입력 >> ");
			arr[i] = sc.nextInt();
		}

		String result = "결과 >> ";

		for (int i = 0; i < n; i++) {
			if (x > arr[i]) {
				result += arr[i]+" ";
			}
		}

		System.out.println(result);
	}

}
