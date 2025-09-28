import java.util.Scanner;

public class Ex12 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		System.out.println("입력해주세요 : ");
		int num1 = sc.nextInt();
		int[][] num = new int[num1][num1];
		int number = 1;
		for (int i = 0; i < num1; i++) {
			for (int j = 0; j < num1; j++) {
				num[j][i] = number++;
			}
		}
		for (int i = 0; i < num1; i++) {
			for (int j = 0; j < num1; j++) {
				System.out.print(num[i][j] + "\t");
			}
			System.out.println();
		}
 
	}
}