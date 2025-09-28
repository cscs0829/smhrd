import java.util.Scanner;

public class Ex15 {
public static void main(String[] args) {

	    Scanner sc = new Scanner(System.in);
	        
	       
	        System.out.print("정수 n 입력: ");
	        int n = sc.nextInt();
	        
	        
	        int[] sequence = new int[n];
	        
	        
	        sequence[0] = 1;
	        
	        
	      
	       
	        for (int i = 1; i < n; i++) {
	            sequence[i] = sequence[i - 1] + i; // 이전 항 + 증가값
	        }
	        
	       
	        System.out.print("수열의 " + n + "번째 항까지: ");
	        for (int i = 0; i < n; i++) {
	            System.out.print(sequence[i] + " ");
	        }
	
}




}
