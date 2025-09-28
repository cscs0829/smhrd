
public class Ex04_overloading {

	public static void main(String[] args) {
		
		// 메소드 오버로딩(중복정의)
		// 조건1 : 메소드의 매개변수 갯수로 구분
		// 조건2 : 메소드의 매개변수 데이터 타입으로 구분
		
		add(2, 5);
		add(3, 1.5);
		add(5, 2.2, 6);
		
		System.out.println(false);
	}
	
	public static double add(int a, double b, int c) {
		return a+b+c;
	}
	
	public static double add(int a, double b) {
		return a+b;
	}
	
	public static int add(int a, int b) {
		return a+b;
	}
	

}
