
public class PiggyBank {
	
	
	// 저금통 설계도
	// 1. 필드 -> 자본(money)
	private int money;
	
	// 2. 메소드
	// 저금 : deposit(int), 출금 : withdraw(int), 잔액확인 : showMoney()
	public void deposit(int input) { 
		this.money += input;
	}
	
	public void withdraw(int output) {
		this.money -= output;
	}
	
	public void showMoney() {
		System.out.println("현재 잔액 : " + money);
	}
	
    
}
