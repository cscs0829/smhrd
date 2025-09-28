package 월급대상프로그램;

public class TempEmployee extends Employee{
			
		// 필드
		  
		public int pay;
		
		
		// 생성자
		public TempEmployee(String empno, String name, int pay) {
			super(empno,name,pay);
			
		}  
		
		//월급리턴
		public int getMoneyPay() {
	        return pay/ 12;
	    }
	
			
}
