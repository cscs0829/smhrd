
public class Ex03_배열실습2 {

	public static void main(String[] args) {
		int cnt =0;
		//1~10 데이터로 초기화 함과 동시에 생성
		int[] intArray = {1,2,3,4,5,6,7,8,9,10};
		System.out.print("intArray에 들어있는 홀수는");
		
		for(int i=0; i<10; i++ ) {
			if(intArray[i]%2==1) {
				System.out.print(intArray[i]+ " ");
				cnt++;
				
			}
		}System.out.println("입니다. 홀수의 총 개수는 " + cnt + "개 입니다");
		

		
		
		
	}

}
