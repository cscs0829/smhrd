
public class Ex02_getsum {

	public static void main(String[] args) {
		
		int num = 100;
		int result = getSum(num); // 약수의 합
		
		System.out.println(num + "의 약수의 합 : "+ result);

		System.out.print("100의 약수 : ");
		getDivisor(num); //
	}
	 public static int getSum(int num) {
	        int sum = 0;
	        for (int i = 1; i <= num; i++) {
	            if (num % i == 0) { 
	                sum += i; 
	            }
	        }
	        return sum;
	    }

	    
	    public static void getDivisor(int num) {
	        for (int i = 1; i <= num; i++) {
	            if (num % i == 0) { 
	                System.out.print(i + " ");
	            }
	        }
	        System.out.println();
		
	}
}
