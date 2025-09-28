package 월급대상프로그램;

public class Main {

public static void main(String[] args) {
	
		// 1. 갹채생성
		RegularEmployee regular = new RegularEmployee("SMHRD0001", "류이수", 8000, 500);
	
		// 사번 이름 연봉 출력
		System.out.println(regular.print());
		
		// 월급 출력
		System.out.println(regular.getMoneyPay());
		
		TempEmployee temp = new TempEmployee("SMHRD0002", "이주희", 10000);
		
		System.out.println(temp.print());
		System.out.println(temp.getMoneyPay());
		
		PartTimeEmployee part = new PartTimeEmployee("SMHRD0003", "박수현", 20, 20);
		System.out.println(part.print());
		System.out.println(part.getMoneyPay());
		
	    }
		
		
	

	}

