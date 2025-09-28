package 월급대상프로그램;

public class PartTimeEmployee extends Employee{
	
	 
	 int workDay;
	
	
	// 생성자
	public PartTimeEmployee(String empno, String name, int pay, int workDay) {
		super(empno,name,pay);
		
		this.workDay = workDay;
	}
	
	//월급리턴
	public int getMoneyPay() {
		// 월 급여를 계산해서 리턴 일당 * 일수
		return pay*workDay;
	}
			

}
