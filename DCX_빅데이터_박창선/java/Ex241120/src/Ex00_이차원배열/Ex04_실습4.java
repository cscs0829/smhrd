package Ex00_이차원배열;

import java.util.Scanner;

public class Ex04_실습4 {

	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		int sum = 0;
		int[][] anser = { {4,5,4,1,2,},    // 정답데이터 
						{0,0,0,0,0},       // 입력데이터
						{10,20,30,20,10}}; // 점수데이터
		
		for(int i =0; i< anser[1].length; i++) {
			
			System.out.print("1번째 답 >> ");
			anser[1][i] = sc.nextInt();
		}
	
		
		for(int i =0; i <anser[1].length; i++) {
		if(anser[0][i]==anser[1][i]) {
			System.out.print("O\t");
			sum += anser[2][i];
		}else
			System.out.print("X\t");
		}
		
		System.out.println("\n총합 : " + sum);
		
		
		
		
		
		
		
	}

}
