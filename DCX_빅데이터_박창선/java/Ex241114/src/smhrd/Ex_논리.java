package smhrd;

public class Ex_논리 {

	public static void main(String[] args) {
		
		// 논리연산자 => boolean
		// 부정연산자 => (NOT) -> ! 
		// 앞선 값의 반대되는 값을 나타내고 싶을 때 사용!!
		
		boolean isCold = true;
		System.out.println(!isCold);
		
		// && (AND) -> 곱연산자
		System.out.println( (10 > 3) && (5 > 2) );
		System.out.println( (10 < 3) && (5 > 2) );
		
		// || (OR) -> 합연산자
		System.out.println( (10 > 3) || (5 > 2) );
		System.out.println( (10 < 3) || (5 < 2) );
		
		
		
		
		
	}

}
