package 월급대상프로그램;

public class RegularEmployee extends Employee{

	      
	int bonus;
	
	
	//생성자 메소드
	public RegularEmployee(String empno, String name, int pay, int bonus) {
		super(empno, name, pay);
		this.bonus = bonus;
	}
	
	//월급리턴
	public int getMoneyPay() {
        return (pay + bonus) / 12;
    }
	
	

	//정보
	public String print() {
        return empno + " : " + name + " : " + pay;
    }
	
	
	
	
	
	
	
}
