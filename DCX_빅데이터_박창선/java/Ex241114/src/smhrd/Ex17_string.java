package smhrd;

import java.util.Scanner;

public class Ex17_string {

	public static void main(String[] args) {
		
		
		//== : 기본타입 8가지를 비교 하는 연산자
		
		
		
		Scanner sc = new Scanner(System.in);
		
		//문자열 입력
		String input_s = sc.next();
		
		if(input_s == "안녕") {
			System.out.println("같습니다");
		} else {
			System.out.println("다릅니다");
			
		}
		
		// string 값을 비교하는 방법
		// 문자열.equals(비교할 문자)
		
		if(input_s.equals("안녕")) {
			System.out.println("같습니다");
		}else {
			System.out.println("다릅니다");
		}
		
		
		
	}

}
