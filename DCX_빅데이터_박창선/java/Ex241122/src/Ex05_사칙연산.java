
public class Ex05_사칙연산 {

	public static void main(String[] args) {
		
		// add, sub, mul, div 매소드 만들고 호출해서 값 출력하기
		
		System.out.println(add(3, 5));
		System.out.println(sub(3, 5));
		System.out.println(mul(3, 5));
		System.out.println(div(3, 5));
		
		
		
		
		
	}
	public static int add(int a, int b) {
		
		int result = a + b;
		
		return result;
	}
	public static int sub(int a, int b) {
		
		int result = a - b;
		
		return result;
	}
	private static int mul(int i, int j) {
		
		return i * j;
	}
	public static int div(int a, int b) {
		
		int result = a / b;
		
		return result;
	}
	
		

	
	
	
	
	
	
	
}


