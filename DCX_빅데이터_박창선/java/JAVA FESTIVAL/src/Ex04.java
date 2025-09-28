import java.util.Scanner;

public class Ex04 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		
		System.out.println("총 금액 입력 : ");
		int mon = sc.nextInt();
		System.out.println("잔돈 : "+ mon);
		int mon1 = 0;
		
		if(mon/10000!=0) {
			System.out.println(mon/10000);
			mon1 = mon%10000;
			
			System.out.println(mon1/5000);
			mon = mon1%5000;
			
			System.out.println(mon/1000);
			mon1 = mon%1000;
			
			System.out.println(mon1/500);
			mon = mon1%500;
			
			System.out.println(mon/100);
			mon1 = mon%100;
		}
		
		
		
		
	}

}
