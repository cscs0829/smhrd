
public class Ex10_제곱수 {

	public static void main(String[] args) {
		
		int base = 2;
		int N = 3;
		int result = powerN(base, N);
		System.out.println("결과 확인 : " + result);

	}
	public static int powerN(int base, int N) {
         
        int num = base;
        for(int i=1; i<N; i++) {
        	num *= base;
        }return num;
        
    
        
	
	
	
	
	}
}
