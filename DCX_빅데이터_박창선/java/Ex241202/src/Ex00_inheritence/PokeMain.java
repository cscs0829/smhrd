package Ex00_inheritence;

public class PokeMain {

	public static void main(String[] args) {
		
		// 1. 내가 좋아하는 포켓몬 2마리 클래스 만들어주기
		// -> 1단계(필드 : 이름, 속성 메소드 : 기본공격)
		// -> 2단계(필드 : 이름, 속성 메소드 : 추가 스킬 1개)
		// -> 3단계(필드 : 동일 메소드 : 추가스킬(오버라이딩), 추가 스킬 1개)
		
		//1. 객체 생성
		Step1 pika = new Step1();
		pika.name = "구구";
		pika.type = "비행";
		
		System.out.print(pika.name+ " ");
		System.out.print(pika.type+ " ");
		pika.attack();
		
		// 2단계
		// -> 1. 1단계 포켓몬을 상속받는다
		// -> 2. 기본공격은 그대로 사용 추가 스킬 1개
		Step2 pikachu = new Step2();
		pikachu.name = "피죤";
		pikachu.type = "비행";
		System.out.print(pikachu.name+ " ");
		System.out.print(pikachu.type+ " ");
		pikachu.attack();
		pikachu.fly();
		
		Step3 laichu = new Step3();
		laichu.name = "피죤투";
		laichu.type = "비행";
		System.out.print(laichu.name+ " ");
		System.out.print(laichu.type+ " ");
		laichu.attack();
		laichu.fly();
		laichu.feng();
		
		
		
		
		

	}

}
