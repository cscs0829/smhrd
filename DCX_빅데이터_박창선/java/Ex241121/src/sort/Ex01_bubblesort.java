package sort;

import java.util.Arrays;

public class Ex01_bubblesort {

	public static void main(String[] args) {
			
		
		// 버블정렬을 이용해서 오름차순으로 정렬
		// 비교하기 위해서 내림차순으로 배열 초기화
		int[] array = {8, 6, 5, 3, 1};
		int tmp; // 빈 상자 
		
		// step1 : 6, 5, 3, 1, 8
		for(int j = 1; j < 5; j++) {
		for(int i = 0; i < array.length-j; i++) {
			if(array[i] > array[i+1]) {
				tmp = array[i+1];
				array[i+1] = array[i];
				array[i] = tmp;	
			}
		}
		}
		// step2 : 5, 3, 1, 6, 8
		
		
		System.out.println(Arrays.toString(array));
//		// step2 :
//		if(array[1]>array[2]) {
//			
//			tmp = array[2];
//			array[2] = array[1];
//			array[1] = tmp;
//		}
//		if(array[2]>array[3]) {
//			
//			tmp = array[3];
//			array[3] = array[2];
//			array[2] = tmp;
//		}
		
		
		
		
		
		
		
		
		
		
		
		//치환하는 방법
//		String 왼손 = "핸드폰";
//		String 오른손 = "마이크";
//		String 책상;
//		
//		System.out.println("왼손 : " + 왼손);
//		System.out.println("오른손 : " + 오른손);
//		
//		책상 = 오른손;
//		오른손 = 왼손;
//		왼손 = 책상;
//		
//		System.out.println("왼손 : " + 왼손);
//		System.out.println("오른손 : " + 오른손);
		
		
		
		
		
		
		
		
		
		
	}

}
