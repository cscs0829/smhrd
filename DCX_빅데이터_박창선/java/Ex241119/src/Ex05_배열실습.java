import java.util.Scanner;

public class Ex05_배열실습 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
	      
	      int[] array = new int[5]; // [0], [1], [2], [3], [4]
	      
	      for(int i = 0; i < array.length; i++) {
	         System.out.print(i+1 + "번째 입력 : ");
	         array[i] = sc.nextInt();
	      }
	      
	      // 입력한 값 출력하기
	      for(int i = 0; i < array.length; i++) {
	         System.out.print(array[i] + " ");
	      }
	      System.out.println();   
	            
	      // 최고점수 출력하기
	      int max = array[0];
	      for(int i = 0; i < array.length; i++) {
	         
	         if(array[i] > max) {
	            max = array[i];
	         }
	         
	      }
	      
	      // 최저점수 출력하기
	      int min = array[0];
	      for(int i = 0; i < array.length; i++) {
	         
	         if(array[i] < min) {
	            min = array[i];
	         }
	         
	      }
	      
	      // 점수총합 출력하기
	      int sum = 0;
	      for(int i = 0; i < array.length; i++) {
	         
	         sum += array[i];
	         
	      }
	      
	      // 점수평균 출력하기
	      System.out.println("최고 점수 : " + max);   
	      System.out.println("최저 점수 : " + min);   
	      System.out.println("점수 총합 : " + sum);   
	      System.out.println("점수 평균 : " + sum/array.length);   
	            
	            
	            
	            
	            
	            
	            
	      
	      
	      
	      
	   }

	}
