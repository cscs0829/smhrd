package Ex00_inheritence;

public class Step3 extends Step2{
	
	
	//Step2 클래스를 상속받는다!
	//다중상속이 불가능해서 -> 상속의 횟수에 제한을 두지 않는다!
	//Step2 클래스를 상속 받아서, Step1, Step2가 가지고 있는
	//모든 기능을 사용한다!
	
	//Step3 -> 필드 다른 클래스와 동일하게 작성
	//      -> 메소드는 1. 스킬을 오버라이딩해서 재정의하기 
	//      -> Step3만 가지고 있는 스킬 만들기
	
	// 1. 스킬 오버라이딩하기
	
	public void fly() {
		System.out.println(name+ "가 하늘 높이 날아올랐다!");
	}
	// 2. 추가 스킬 만들어주기! (Step3만 가지고 있는 기능)
	public void feng() {
		System.out.println(name+"은 더 단단해졌다");
	}
	
	
}
