import java.nio.file.spi.FileSystemProvider;

public class Ex01_변수 {

	public static void main(String[] args) {
		
		//변수는 왜 사용할까?? --> 재사용을 위해서
		
		int  num = 1000;
		
		System.out.println(num+2);
		System.out.println(num-2);
		System.out.println(num*2);
		System.out.println(num/2);
		
		// 변수 선언 및 생성
		int a = 200;
		
		// 1. 변수 선언
		int b;
		// 2. 변수의 할당(초기화)
		b = 5;
		//3 . 변수의 재할당
		b = 10;
		
		System.out.println(b);
		
		// 상수 선언 및 생성
		final int PI = 3;
		// c = 6; --> 상수는 재할당 불가능
				
		// 변수명 작성규칙
		// 필수!!
		// 1. 키워드 사용 불가
		// 2. 대소문자 구별
		// 3. 숫자로 시작 불가
		// 4. 특수문자 중 '_'와 '$'만 가능

		// 필수는 아니지만 관습
		// 1. 클래스 이름은 대문자로 시작하자 (Ex01_변수)
		// 2. 변수 이름은 소문자로 시작하자 
		// 3. 상수는 모두 대문자로 표기하자 
		// 4. 띄어쓰기가 필요할 경우
		// 4-1 '_'(언더바) 사용하기
		int person_age = 20;
		// 4-2 다음 키워드의 첫 글자를 대문자로(카멜표기)
		int personAge = 30;
		
		boolean bool = true;
		System.out.println(bool);
		// boolean bool = false;
		// 문자형 - ''
		char ch = 'a'; //문자형은 한가지
		System.out.println(ch);
		
		//번외 문자형 -String 레퍼런스
		String s = "hello world";
		System.out.println(s);
		
		byte by = 127; // -128~127
		System.out.println(by);
		
		short sh = 100;
		System.out.println(sh);
		
		int i = 100;
		System.out.println(i);
		
		long lo = 7000;
		System.out.println(lo);
		
		//실수형 타입
		float fl = 3.14f; //float는 값 뒤에 f를 붙여주어야 한다.
		System.out.println(fl);
		
		double dob = 3.14;
		System.out.println(dob);
		
		// 형 변환 (casting)
		
		// 자료형을 변환시키겠다.
		
		// 특정자료형을 다른 자료형으로 바꾼다.
		
		
		
		
	}

}
