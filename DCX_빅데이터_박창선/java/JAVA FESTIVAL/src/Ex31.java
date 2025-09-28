import java.util.Scanner;

public class Ex31 {

	public static void main(String[] args) {
		System.out.print("입력 : ");
		Scanner sc = new Scanner(System.in);
		int num = sc.nextInt();
				
		int result = 1;
				
		System.out.print("출력 : ");
		for(int i =1; i <= num; i++) {
			result *= i;
		}
				
		System.out.println(result);

	}

}
