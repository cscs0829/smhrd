package smhrd;

public class Ex17_yaksu {

	public static void main(String[] args) {
		
		
		//약수 ==> 나누어 떨어지는(나머지가 0)는 정수
		
		//6의 약수는 1,2,3,6
		
		//1~6까지 다 나누어서 나머지가 몇 인지 확인
		
		//6의 약수를 구하는 코드 반복문
//		System.out.print("6의 약수 : ");
//		for(int i = 1; 1<=6; i++) {
//			if(6 % i == 0) {
//				
//			System.out.print(i+ " ");
//			}
//		}

		
		//2~ 32의 약수를 구하세요
		
		for(int i = 2; i <= 64; i++) {
			System.out.print(i+"의 약수 : ");
			
			for(int j = 1; j<=i; j++) {
				if(i % j == 0) {
					System.out.print(j+ " " );
					
					
				}
			}System.out.println();
		}
		
		
	
}

}
