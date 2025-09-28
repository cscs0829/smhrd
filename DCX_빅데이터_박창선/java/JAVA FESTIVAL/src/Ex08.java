import java.util.Scanner;

public class Ex08 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		
		
		while(true) {
			
			System.out.print("A 입력 >> ");
			int num = sc.nextInt();
			System.out.print("B 입력 >> ");
			int num1 = sc.nextInt();
			
			if(num==0&&num1==0) {
				break;
			}else {
				System.out.println("결과 >> " + (num-num1));
			}
		}
		
	}

}
