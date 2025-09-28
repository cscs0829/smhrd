package Ex00_이차원배열;

public class Ex01_실습1 {

	public static void main(String[] args) {
		
		// 1 ~ 25까지 5행 5열의 array 초기화하기
		// 5행 5열의 이차원배열
		
		int[][] array = new int[5][5];
		
		int cnt = 1;
		
		// 값을 대입하는 부분
		for(int j = 0; j < array.length; j++) {
			
			for(int i = 0; i < array[0].length; i++) {
				array[j][i] = cnt;
			cnt++;	
				System.out.print(array[j][i]+ " ");
			}
			System.out.println();
		}
		
		
		
		
		// 0행
		for(int i = 0; i < array[0].length; i++) {
			array[0][i] = 1;
			cnt++;
		}
		// 5

		// 1행
		for(int i = 0; i < array[1].length; i++) {
			array[0][i] = cnt;
			cnt++;
		}
		// 2행
		for(int i = 0; i < array[1].length; i++) {
			array[0][i] = cnt;
			cnt++;
		}
		// 0,1 0,1 0,2 0,3 0,4
		array[0][0] = 1;
		array[0][1] = 2;
		array[0][2] = 3;
		array[0][3] = 4;
		array[0][4] = 5;
		
		// 1행 
		array[1][0] = 6;
		array[1][1] = 7;
		array[1][2] = 8;
		array[1][3] = 9;
		array[1][4] = 10;
		
		// 2행 
		array[2][0] = 11;
		array[2][1] = 12;
		array[2][2] = 13;
		array[2][3] = 14;
		array[2][4] = 15;
		
		
		
		
		
		

	}

}
