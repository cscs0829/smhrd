
public class Ex02_casting {

	public static void main(String[] args) {
	
		// 기본 타입의 형 변환 (casting)
		// 특정자료형을 다른 자료형으로 바꾼다.
		
		// 1. 자동 형 변환(묵시적)
		// 더 작은 자료형이 큰 자료형을 바뀔때
		
		int num1 = 10;
		double num2 = num1;
		
		// num1 타입 -> int
		// num2 -> double
		System.out.println(num2);
		
		// 실수 > 정수
		float num3 = num1;
		System.out.println(num3);
		
		// 2. 강제 형 변환(명시적)
		// 2.1 작은 자료형이 더 큰 자료형을 바뀔 때
		// 2.2 큰 자료형이 작은 자료형으로 바뀔 때
		
		// 2.1의 예시
		System.out.println((float)num1);
		
		// 2.2의 예시
		System.out.println((int)num3);

		
	}

}
