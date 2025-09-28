import java.util.Scanner;

public class EX01 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.println("일할시간을 입력하세요 : ");
		int si = sc.nextInt();
		
		int don = 5000;
		int don1 = 7500;
		
		
		if(si<9) {
		System.out.println(si * don);
		}else if(si>=9) {
			System.out.println( si * don1-20000);
		}
			
		
		

	}

}
