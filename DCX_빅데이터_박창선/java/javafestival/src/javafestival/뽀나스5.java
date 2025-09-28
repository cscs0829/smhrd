package javafestival;

import java.util.Scanner;

public class 뽀나스5 {

	public static void main(String[] args) {
		Scanner sc =new Scanner(System.in);
		
		int[] oc = new int[5];
		
		for(int i=1; i<=6; i++) {
			System.out.println(i+"번째 수 입력 : ");
			oc[i] = sc.nextInt();
			
		}
		for(int i=1; i <=6; i++) {
			if(oc[1]>oc[i]) {
				oc[1]=oc[i];
			}else if(oc[2]>oc[i]) {
				oc[2]=oc[i];
			
			}else if(oc[3]>oc[i]) {
				oc[3]=oc[i];
			}else if(oc[4]>oc[i]) {
				oc[4]=oc[i];
			}
			
		}System.out.println();
		
		

	}

}
