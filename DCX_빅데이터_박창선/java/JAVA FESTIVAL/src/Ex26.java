import java.util.Scanner;

public class Ex26 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.print("첫 번째 숫자 입력 >> ");
		int num1 = sc.nextInt();
		System.out.print("두 번째 숫자 입력 >> ");
		int num2 = sc.nextInt();
				
		int output1 = num1*(num2%100%10);
		int output2 = num1*(num2%100/10);
		int output3 = num1*(num2/100);
				
		System.out.println(output1);
		System.out.println(output2);
		System.out.println(output3);
		System.out.println(num1*num2);

	}

}
