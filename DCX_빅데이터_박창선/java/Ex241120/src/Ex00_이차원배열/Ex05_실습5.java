package Ex00_이차원배열;

public class Ex05_실습5 {

	public static void main(String[] args) {
		
		int size = 5; // 배열의 크기
        int[][] array = new int[size][size];
        int number = 1; // 다이아몬드에 넣을 숫자 초기값
        int center = size / 2; // 배열의 중심 위치

        // 다이아몬드 모양으로 숫자 채우기
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                if (Math.abs(center - i) + Math.abs(center - j) <= center) {
                    array[i][j] = number++; // 다이아몬드 내부에 숫자를 채움
                } else {
                    array[i][j] = 0; // 나머지는 0
                }
            }
        }

        // 배열 출력
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                System.out.printf("%2d ", array[i][j]); // 2자리 숫자로 정렬 출력
            }
            System.out.println();
        }

		
		
		
	}

}
