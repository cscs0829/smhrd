
public class Ex02_배열실습1 {

	public static void main(String[] args) {
		
		
		//문자열 데이터를 담을 수 있는 arrStr 배열선언
		
		//10칸 배열 생성
		
		//0~9 인덱스 중에서 0~4인덱스에 java, html, db, python, css 값 넣기
		
		//0~9 인덱스 값 출력하기(for문 활용)
		
		String[] arrStr = new String[10];
		
		arrStr[0] = "java";
		arrStr[1] = "html";
		arrStr[3] = "db";
		arrStr[4] = "python";
		arrStr[5] = "css";
	
		
		for(int i= 0; i<arrStr.length; i++ ) {
			System.out.println(arrStr[i]);
		}
		
		
		
		
	}

}
