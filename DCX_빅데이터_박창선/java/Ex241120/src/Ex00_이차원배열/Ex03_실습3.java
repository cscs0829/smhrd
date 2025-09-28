package Ex00_이차원배열;

public class Ex03_실습3 {

	public static void main(String[] args) {
		
		int array[][] = new int[5][5];
		int cnt = 1;
		
		for(int j = 0; j < array.length; j++) {
			for(int i = 0; i < array[j].length; i++) {
				array[j][i] = cnt;
	            cnt++;
	            
			}
		}
		for(int j = 0; j < array.length; j++) {
			for(int i = 0; i < array[j].length; i++) {
			
				if(j%2==0) {
					// 짝수형 0, 2, 4
					System.out.print(array[j][i]+ " ");
					
				}else {
					System.out.print(array[j][4-i]+ " ");
					
				}
				
	         }System.out.println();
		}
		

	}

}
