package smhrd;

public class Ex15_if {

	public static void main(String[] args) {
		
		//단순 if 문 여러개의 다중 if (if-else)문의 차이점
		
		int num1 = 16;
		
		//단순 if문의 경우
		
		if(num1 < 20 ) {
			System.out.println("20 이하");
		}
		if(num1 < 35 ) {
			System.out.println("35 이하");
		} //if문 2개 동시에 써봤자 별개이다.
		
		// 다중 if문(if-else if)
		if(num1 <20) {
			System.out.println("20이하");
		} else if(num1 <35) {
			System.out.println("35이하");
		}
		
		
		
		
		
		
		
		
		
		
		
		
		

	}

}
