import java.util.Scanner;

public class Ex04_oper {

	public static void main(String[] args) {
		
		// 두개의 정수를 입력 받아 
		// 사칙연산 결과값을 출력(단, 나눈 결과값은 실수로 표현)
		
		//입력 할 수 있는 Scanner 사용
		Scanner sc = new Scanner(System.in);

		System.out.print("첫번째 정수 입력 : ");
		int num1 = sc.nextInt(); //
		//System.out.println(num1);
		System.out.print("두번째 정수 입력 : ");
		int num2 = sc.nextInt();
		
		System.out.println("더한 결과값 : "+ (num1 + num2) );
		System.out.println("뺀 결과값 : "+ (num1 - num2) );
		System.out.println("곱한 결과값 : "+ (num1*num2) );
		System.out.println("나눈 결과값 : "+ (double)num1/num2); 
		// num1만 실수로 바꿔주면 가능 나머지까지 나옴
		

	}

}
