public class Ex00_매소드 {

	public static void main(String[] args) {
		
		
//		//회사
//		System.out.println(3+10);
//		System.out.println(4+11);
//		System.out.println(5+9);
//		System.out.println(6+15);
		//메소드 호출
		//메소드 이름(매개변수);
		add(3, 5);
		add(4, 11);
		add(7, 45);
		add(1, 64);	
	}
	
	//매소드 구조
	//public : 접근제한자(private, default, protected)
	//static : 저장공간
	//리턴타입 : int, String, double...(리턴값이 없을 때 : void)
	//메소드 이름(매개변수){
	//       실행문;
	//}
	public static void add(int a, int b) {
		System.out.println(a+b);
	}
		
		
		

	

}
