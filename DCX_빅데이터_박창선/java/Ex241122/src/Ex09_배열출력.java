
public class Ex09_배열출력 {

	public static void main(String[] args) {
		
		
		int[] array = {1,3,5,7,9,11};
		
		arrayToString(array);
		

	}

	public static void arrayToString(int[] array) {
		
		
		// 확장 for문(foreach문) : 무조건 0번 인덱스부터 마지막 인덱스까지 순차적으로 접근
		for( int num : array) {
			System.out.println(num + " ");
			
		}
		
		
//		for(int i = 0; i < array.length; i++){
//			System.out.print(array[i]+ " ");
//		}
		
		
		
	}
	
	
	
	
}
