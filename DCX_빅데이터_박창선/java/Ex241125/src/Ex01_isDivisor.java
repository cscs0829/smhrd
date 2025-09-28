public class Ex01_isDivisor {

    public static void main(String[] args) {
        int num1 = 10;
        int num2 = 2;
        boolean divisor = isDivisor(num1, num2); 

        System.out.println(divisor); 
    
    }
    
    public static boolean isDivisor(int num1, int num2) {
		if (num1 % num2 == 0) {
			return true;
		} else {
			return false;
		}
    
    }
}
