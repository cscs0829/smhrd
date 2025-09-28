package smhrd;

import java.util.Scanner;

public class Ex_11_14_예제3 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.print("나이 입력 :");
		int age = sc.nextInt();
		
		if(age>=20) {
			System.out.print("성인 입니다.");
		}else {
			// 조건식 x if 이외의 나머지 조건
			System.out.print("미성년자 입니다.");
		}
		//else 구문
		//else - 그 외 나머지 
		
		
	}

}
		