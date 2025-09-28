
public class Ex08 {

	public static void main(String[] args) {
		
		int num1 = 11;
		int num2 = 5;
		
		int result = close(num1, num2);
		System.out.println("10에 가까운 수 "+ result);
	}
	public static int close(int num1, int num2) {
        int result = 0; 
        int min = Math.abs(num1-10);
		int min1 = Math.abs(num2-10);
        
		
//		  //int a = 10 - num1;
//	      int b = 10 - num2;
//	      if(a < 0) {
//	         a *= -1;
//	      }
//	      if(b < 0) {
//	         b *= -1;
//	      }

		if (min < min1) {
            result = num1; 
        } else {
            result = num2; 
        }
        return result; // 결과 반환
	
	
	
	
	
	
	
	}	
}
