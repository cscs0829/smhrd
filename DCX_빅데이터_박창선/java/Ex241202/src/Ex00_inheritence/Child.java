package Ex00_inheritence;

public class Child extends parent{
	
	//설계만 할거라 main 메소드 만들지 않음
	
	//새로운 클래스, 자식 클래스, 서브 클래스
	//한식당 2호점
	//extends --> 연장하다, 확장하다 의미
	// : class를 선언하는 구간에 작성한다!
	
	// 제육볶음, 돈까스 --> 구현 x 
	
	// 1. 새로운 메뉴 추가하기
	
	public void makeguk() {
		System.out.println("맛있는 국밥을 만든다!");
	}
	
	// 2. 메소드 오버라이딩(재정의)를 통해서 메뉴 업그레이드
	public void makeDon() {
		System.out.println("맛있는 치즈 돈까스를 만든다!");
	}
	
	// 메소드 오버라이딩
	// : 상속이 전제되어있어야 사용이 가능!
	// : 부모 클래스가 가지고 있는 메소드의 틀(리턴타입, 메소드명, 매개셥ㄴ수)
	// 그대로 가지고 와서 {} 안쪽의 로직만 재정의하는 기법!
	
	
	
	

}
