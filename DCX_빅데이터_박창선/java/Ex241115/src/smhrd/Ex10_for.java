package smhrd;

public class Ex10_for {

	public static void main(String[] args) {
		
		//21부터 57까지 출력
		for(int i= 21; i<=57; i++) {
			System.out.println(i);
		}
		
		//96부터 53까지 출력
		for(int i = 96; i>= 53; i--) {
			System.out.println(i);
		}
		
		//21부터 57까지 중 짝수 출력
		for(int i = 21; i<=57; i++) {
			if(i %2 ==0) {
				System.out.println(i);
			}
		}
		
		//21부터 57까지 홀수 출력
		for(int i = 21; i <=57; i++) {
			if(i%2==1) {
				System.out.println(i);
			}
		}
		
		
	}

}
