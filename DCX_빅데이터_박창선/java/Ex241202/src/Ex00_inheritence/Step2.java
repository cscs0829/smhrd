package Ex00_inheritence;

public class Step2 extends Step1{

	// Step1을 상속받는 Step2의 진화
	
	//2단계 포켓몬
	//이미 만들어진 클래스를 활용하여 새로운 클래스를 생성 ->
	
	//새로운 스킬 메소드 작성 (기능의 확장)
	
	
	//상속을 받으면, 필드(name, type)와 메소드(기본공격)
	//그대로 사용 가능하다!
	public void fly() {
		System.out.println(name+ "가 하늘 높이 날아올랐다!");
	}
}
