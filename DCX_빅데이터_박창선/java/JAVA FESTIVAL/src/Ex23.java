
public class Ex23 {

	public static void main(String[] args) {
		int[][] arr = new int[5][5];

		System.out.println("90도 회전");

		int cnt = 1;

		for (int j = 0; j < 5; j++) {
			for (int i = 4; i >= 0; i--) {
				arr[i][j] = cnt;
				cnt++;
			}
		}

		for (int j = 0; j < 5; j++) {
			for (int i = 0; i < 5; i++) {
				System.out.print(arr[j][i]+"\t");
			}System.out.println();
		}

	}

}
