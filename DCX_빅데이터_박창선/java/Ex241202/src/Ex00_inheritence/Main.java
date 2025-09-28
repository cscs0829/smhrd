package Ex00_inheritence;

public class Main {

	public static void main(String[] args) {
			
		// 우리가 만든 클래스를 실행하는 공간

		//상속 특징 3가지
		//1. 다중 상속이 불가능하다 (JAVA)
		//2. 상속의 횟수에 제한이 없다.
		//3. 모든 클래스는 OBJECT(최상위 클래스)를 상속받는다.
		//----------> OBJECT -> 클래스 공통의 조상
		
		
		// 1. parent 클래스 객체 p 생성
		// -> 가지고 있는 음식 만들기 메소드 사용해보기!
		parent p = new parent();
		
		//객체의 기능 사용하기
		p.makeDon();
		p.makeJae();
		
		
		// 2. Child 클래스로 객체 c 생성
		// -> 부모가 가지고 있는 메소드 사용해보기
		// ->부모가 가지고 있는 나만의 메소드 사용해보기
		System.out.println();
		Child c = new Child();
		c.makeDon();
		c.makeJae();
		c.makeguk();
//시험문제 메소드 오버라이딩
		
		
	}

}
