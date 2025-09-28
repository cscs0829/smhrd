package 보강;

public class 이중for {

	public static void main(String[] args) {
		
		int[][] num = new int[5][5];
		int number = 1;
		for(int i=0; i<5; i++ ) {
			for(int j = 0; j<5; j++) {
				num[i][j] = number++;
				
			}
		}for (int i = 0; i < 5; i++) {
			for (int j = 0; j < 5; j++) {
				System.out.print(num[j][i] + "\t");
			}
			System.out.println();

	}

}
}
