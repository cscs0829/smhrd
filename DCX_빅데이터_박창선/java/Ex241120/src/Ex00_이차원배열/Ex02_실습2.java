package Ex00_이차원배열;

public class Ex02_실습2 {

	public static void main(String[] args) {
		
		int[][] array = new int[5][5];
		
		int cnt = 1;
		
		   // 값을 대입하는 부분
	      for (int j = 0; j < array.length; j++) {
	         // 0행
	         for (int i = 0; i < array[j].length; i++) {
	            array[j][i] = cnt;
	            cnt++;
	            System.out.print(array[j][i] + "\t");
	         }System.out.println();
	      }

		
		 // 값을 출력하는 부분
	      for (int j = 0; j < array.length; j++) {
	         // 0행
	         for (int i = 0; i < array[j].length; i++) {
	            System.out.print(array[j][4-i] + "\t");
	         }
	         System.out.println();
	      }

	}

}
