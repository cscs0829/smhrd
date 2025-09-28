import java.util.Scanner;

public class Ex_00 {

	public static void main(String[] args) {
		
		
		// 키보드를 통해(Console창을 통해) 데이터를 입력해보자!
		
		// Scanner 
		
		// import : 외부의 도구(라이브러리)를 사용하기 위해 설정하는 키워드
		
		Scanner sc = new Scanner(System.in);
		
		// 꾸며주는 문구(출력문)
		// 정수 입력 : 5
		System.out.print("정수 입력 : ");
		int num = sc.nextInt();
		
		System.out.println("내가 입력한 정수 : " + num);
			
		
		
	}

}
