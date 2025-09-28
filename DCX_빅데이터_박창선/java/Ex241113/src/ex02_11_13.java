import java.util.Scanner;

public class ex02_11_13 {
	public static void main(String[] args) {
	
		Scanner sc = new Scanner(System.in);
		
		System.out.print("초 입력 : ");
		int num1 = sc.nextInt();
		
		
		System.out.print(num1/3600 +"시");
		
		System.out.print(num1/60%60 +"분");
		
		System.out.print(num1%60+"초");
		
		
		
		
		
		
}
}
