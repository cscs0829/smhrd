
public class Ex03_oper {

	public static void main(String[] args) {
		int num1 = 10;
		int num2 = 7;
		float num3 = 10.0f;
		float num4 = 7.0f;
		
		System.out.println(num1/num2);
		System.out.println(num1%num2);
		System.out.println(num3/num4);
		System.out.println(num1/num4);
		System.out.println(num4/num1);
		// int랑 float랑 나누었을 때 
		// 자동 형변환 결과값이 float
		
		
		// num1 / num4 => 결과값을 int로 하고 싶은 경우
		// 1. num4를 인트로 강제 형변환
		System.out.println(num1/(int)num4);
		// 2. 결과값을 int로 강제 형변환
		System.out.println((int)(num1/num4));
		
		//문자열 더하기~~ 
		String s1 = "hello";
		String s2 = "world";
		System.out.println(s1+s2);
		
		// 숫자 + 문자 
		System.out.println(num1 + s1);
		System.out.println(num1+"의 숫자는 19입니다.");
		
		// 사칙연산의 순서를 그대로 따릅니다.
		// 문자열 + 정수형 -> 문자열로 자동 형변환
		System.out.println("num1과 num2의 합은"+num1+num2+"입니다."); 
		
		
		
	}

}
