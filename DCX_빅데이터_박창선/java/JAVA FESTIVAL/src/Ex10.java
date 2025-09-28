import java.util.Random;
import java.util.Scanner;

public class Ex10 {

    public static void main(String[] args) {
    	int[] score = new int[8];
		
		Scanner sc = new Scanner(System.in);
		Random rd = new Random();
		for(int i = 0; i<8;i++) {
				
		score[i]= rd.nextInt(100)+1;
			
		}
		System.out.print("배열에 있는 모든 값 : ");
		for(int i=0;i<8;i++) {
			System.out.print(score[i] + " ");
		}
		System.out.println();
		int max = score[0];
		for(int i = 0; i<score.length;i++) {
			if(max<score[i]) {
				max = score[i];
		}
	}
		
	
		int min = score[0];
		 for(int i= 0; i<score.length;i++) {
			if(min>score[i]) {
				min = score[i];
			}
		 }
		 System.out.println("가장 큰 값 : " + max);
		 System.out.println("가장 작은 값 : " + min);
		 sc.close();
	}
}