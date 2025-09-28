import java.util.Scanner;

public class Ex27 {

	public static void main(String[] args) {
		System.out.println("==== 채점하기 ====");
		Scanner sc = new Scanner(System.in);
		String input = sc.next();
				
		String[] arr = input.split("");
				
		int cnt = 0;
		int sum = 0;
				
		for(int i = 0; i < arr.length; i++) {
			switch(arr[i]) {
			case "o" :
				cnt ++;
				sum += cnt;
				break;
			case "x" :
				cnt = 0;
				break;
			}
		}
				
		System.out.println(sum);
	}

}
