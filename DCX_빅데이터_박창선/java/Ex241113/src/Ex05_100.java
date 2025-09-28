import java.util.Scanner;

public class Ex05_100 {
	public static void main(String[] args) {
		
		//변수 num을 입력 받아 백의 자리 이하를 버리는 코드
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("정수 입력 : ");
		int num = sc.nextInt();
		
		int result = num/100;
		
		System.out.println("결과값 : " + result*100);
		
}
}
