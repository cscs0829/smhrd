package buildUp;

public class Ex02ArrayOut {

	public static void main(String[] args) {
		
		int[] array = {1, 2, 3};
		
		try {
			
			//System.out.println(array[3]);
			System.out.println(100/0);
			
//		} catch (ArrayIndexOutOfBoundsException e) {
//			System.out.println("인덱스에 잘못 접근했습니다");
//		}catch (ArithmeticException e) {
//			System.out.println("0으로 나눴습니다!");
//			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		System.out.println("프로그램 종료!");
		
		
		
		
		
		
		

	}

}
