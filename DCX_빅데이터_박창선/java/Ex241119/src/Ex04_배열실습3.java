
public class Ex04_배열실습3 {

	public static void main(String[] args) {
		
		int max =0;
		int[] intArray = {20,13,24,60,11};
		
		System.out.print("가장 큰 수는 ");
		
	for(int i=0; i < 4; i++) {
		if(intArray[max] < intArray[i]) {
		intArray[max] = intArray[i];
	}
		}System.out.print(intArray[max]+" 입니다");
		
		
		
	
		
		
		
		
		
		
		
		

	}

}
