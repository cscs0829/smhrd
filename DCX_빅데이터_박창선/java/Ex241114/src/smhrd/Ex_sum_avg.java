package smhrd;
		
import java.util.Scanner;
		
public class Ex_sum_avg {
		
	public static void main(String[] args) {
		
		// 단축키
		// 줄복사 : Ctrl+Alt+방향키(위 or 아래)
		// 줄이동 : Alt + 방향키(위 or 아래) 
		
		// 주석처리 : Ctrl + "/"
		// 줄 삭제 : Ctrl + "D"
 		
		// Java, Web, Python 점수를
		// 키보드를 입력받아(Scanner)
		// 합계(sum), 평균(avg) 구하기
		// 단, 평균은 실수로 표시
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("Java 점수 입력 : ");
		int java = sc.nextInt();
		System.out.print("Web 점수 입력 : ");
		int web = sc.nextInt();
		System.out.print("Python 점수 입력 : ");
		int python = sc.nextInt();
		
		// 연산 우선순위
		// 괄호() > 곱셈, 나눗셈 > 덧셈, 뺄셈
		System.out.println("합계 : "+ (java + web + python));
		System.out.println("평균 : "+ ((double)java + web + python)/3);
	}	
		
}		
