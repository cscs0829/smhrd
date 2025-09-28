package smhrd;

public class Ex16_gugudan {

	public static void main(String[] args) {
		
		
		for(int j = 2; j<=9; j++) {
			System.out.print(j+"단 : ");
			for(int i = 1; i<=9; i++) {
				System.out.print(j+"*" + i + "="+ i*j + " ");
				
			}
			System.out.println();
			
		}
		
		
		System.out.print("2단 : ");
		for(int i = 1; i<=9; i++) {
			System.out.print("2*" + i + "="+ i*2 + " ");
			
		}
		System.out.println();
		
		System.out.print("3단 : ");
		for(int i = 1; i<=9; i++) {
			System.out.print("3*" + i + "="+ i*3 + " ");
			
		}
		System.out.println();
		
		System.out.print("4단 : ");
		for(int i = 1; i<=9; i++) {
			System.out.print("4*" + i + "="+ i*4 + " ");
			
		}
		
		
		
		
		
		
		

	}

}
