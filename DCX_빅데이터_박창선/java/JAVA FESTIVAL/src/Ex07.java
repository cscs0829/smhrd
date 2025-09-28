import java.util.Scanner;

public class Ex07 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("행 개수 : ");
		int num = sc.nextInt();
		
		for(int i=0; i <= num; i++) {
			for(int g=num; g>i; g--) {
				System.out.print("*");
			}
			
			System.out.println();
		}
		
		
		
		

	}

}
