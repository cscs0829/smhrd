package sort;

import java.util.Arrays;

public class Ex02_selectionSort {

	public static void main(String[] args) {
		
		// 선택정렬 : 가장큰 값 또는 가장 작은 값을 찾아 해당하는 인덱스로 이동하는 방법
		// 내림차순 : 
		
		int[] array = {7,98,13,70,24};
		
		// step1 : 98, 7, 13, 70, 24
		int maxIndex = 0; // 인덱스 값
		for(int j = 0; j < array.length; j++) {
		for(int i = j+1; i < array.length; i++) {
			if(array[maxIndex] < array[i]) {
				maxIndex = i;
			}
			
		}
		int tmp = array[j];
		array[j] = array[maxIndex];
		array[maxIndex] = tmp;
		}
		System.out.println(Arrays.toString(array));
		
		//step2 : 90,70,13,7,24 
//		for(int i = 2; i < array.length; i++) {
//			if(array[maxIndex]<array[i]) {
//				maxIndex = i;
//			}
//		}
//		tmp = array[1];
//		array[1] = array[maxIndex];
//		array[maxIndex] = tmp;
//		System.out.println(Arrays.toString(array));
	}

}
