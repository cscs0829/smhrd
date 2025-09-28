package buildUp;

public class Ex01_Divide0 {

	public static void main(String[] args) {
		
		//자바의 오류
		// 1.컴파일 오류 : 문법적인 오류
		System.out.println("컴파일 오류!");
		
		// 2. 런타임 오류 : 문법적인 오류가 아닌 실행 시에 나타나는 오류
		
		try {			
			
			System.out.println(100 / 0);
			System.out.println("다른 코드");
			
		}catch (ArithmeticException e) {
			
			System.out.println("0으로는 못나눠요!");
			e.printStackTrace();
	
		}finally {
			//무조건 실행된다
			System.out.println("예외에 상관없이 실행!");
	
		}
		
		System.out.println("다음 코드~");
		
		
		
		
		
		
		
		
		
	}

}
