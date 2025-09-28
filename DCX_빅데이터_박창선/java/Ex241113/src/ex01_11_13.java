import java.util.Scanner;

public class ex01_11_13 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Java 점수 입력 : ");
		int num1 = sc.nextInt();
		
		System.out.print("Web 점수 입력 : ");
		int num2 = sc.nextInt();
		
		System.out.print("Python 점수 입력 : ");
		int num3 = sc.nextInt();
		
		int num4 = num1+num2+num3;
		
		System.out.println("합계 : "+ num4);
		
		
		
		double result = num4/3;
				
		System.out.printf("평균 : "+"%.2f",result);
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}

}
