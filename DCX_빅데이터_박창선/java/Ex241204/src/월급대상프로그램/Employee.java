package 월급대상프로그램;

public abstract class Employee {
	
	// 접근제한자
	// public > protected > package(default) > private
	// public : 모든 외부 클래스에서 접근 가능
	// protected : 패키지 내에 있는 클래스만 접근 가능 (상속관계라면 다른 패키지도 가능)
	// package(default) : 같은 패키지 내에 있는 클래스만 접근 가능
	// private : 외부 클래스에서는 접근 불가
	
	
	// 상속을 사용해서 자식 클래스를 만들기 위한 
	// 설계도의 설계도!
	protected String empno;  
	protected String name;   
	protected int pay; 
		
	public Employee(String empno, String name, int pay) {
		super(); //부모클래스
		this.empno = empno;
		this.name = name;
		this.pay = pay;
	}
	
	public abstract int getMoneyPay();
	//정보
	public String print() {
	return empno + " : " + name + " : " + pay;
		
		
		
	}
	
	
	
	
}
