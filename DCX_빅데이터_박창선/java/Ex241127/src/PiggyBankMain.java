public class PiggyBankMain {

	public static void main(String[] args) {
		
		
		PiggyBank pig = new PiggyBank();
		

		// 저금통에 1500원 , 700원 저금
		pig.deposit(1500);
		pig.deposit(700);
        
        		
		// 잔액 확인
        pig.showMoney();
		// 저금통에서 500원 출금
        pig.withdraw(500);		
		// 잔액확인
        pig.showMoney();
        System.out.println();
				
						
	}

}
