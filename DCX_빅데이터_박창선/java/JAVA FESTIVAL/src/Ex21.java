
public class Ex21 {

	public static void main(String[] args) {
		
		int[] point = {92,32,52,9,81,2,68};

		// 기준값 만들기
		int min = Math.abs(point[0] - point[1]);

		// 배열의 위치를 기억할 수 있는 변수
		int a = 0;
		int b = 0;

		// 반복적인 작업으로 배열의 거리값 비교하기
		for (int j = 0; j < point.length; j++) {
			for (int i = 0; i < point.length; i++) {
				if (j != i) {
					if (Math.abs(point[j] - point[i]) < min) {
						min = Math.abs(point[j] - point[i]);
						a = j;
						b = i;
					}
				}
			}
		}

		System.out.println("result = [" + a +", " + b + "]");
}
}