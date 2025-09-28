package serch;

public class Ex02_BinarySearch {

	public static void main(String[] args) {
		
		// 이진탐색
		// 무조건 정렬이 되어있는 상태여야 함
		int[] array = {1,7,16,25,30,33,41,66,78,90};
		int search = 78;
		int lowIndex = 0;
		int highIndex = array.length-1;
		
		while(true) {
			
			int midIndex = (lowIndex + highIndex)/2;
			if(search== array[midIndex]) {
				System.out.println(search + "은(는)" + midIndex+ "번째!!");
				break;
			}else if(search > array[midIndex]) {
				lowIndex = midIndex + 1;
			}else {
				highIndex = midIndex-1;
			}
			
			
			
		}
		
		
		
		
		
		
		
		
		
		

		
		
		
		
		
	}

}
