package javafestival;

import java.util.Arrays;

public class 번13 {

	public static void main(String[] args) {
		
		String score = "A,A,B,C,D,A,C,D,D,D,F";
		
		int cnta = 0; 
		int cntb =0; 
		int cntc =0; 
		int cntd =0; 
		int cntf =0; 
		
		String[] array = score.split(",");
        System.out.println(Arrays.toString(array));
        
        for(int i =0; i < array.length; i++) {
        if(array[i].equals("A")) {
        	cnta++;
        }else if(array[i].equals("B")) {
        	
        
        	cntb++;
        }else if(array[i].equals("C")) {
        	cntc++;
        }else if(array[i].equals("D")) {
        	cntd++;
        }else if(array[i].equals("F")) {
        	cntf++;
        }
        }System.out.println("A : " + cnta);
        System.out.println("B : " + cntb);
        System.out.println("C : " + cntc);
        System.out.println("D : " + cntd);
        System.out.println("F : " + cntf);
		
		
		
		

	}

}
