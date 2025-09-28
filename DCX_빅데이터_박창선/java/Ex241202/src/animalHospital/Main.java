package animalHospital;

public class Main {

	public static void main(String[] args) {

		//객체의 캐스팅
		
		Animal a1 = new Animal();

		Dog d1 = new Dog();
		
		Cat c1 = new Cat();
		
		Bird b1 = new Bird(); 
		// 객체의 형변환 (casting)
		// Reference type에서의 형변환은 반드시 "상속"이 전제 되어있어야한다!
		// -> 객체 내의 필드, 메소드의 접근 권한을 기준으로 강제 vs 자동 결정!
		
		// 1. UpCasting (업케스팅 - 자동형변환)
		// : 자식 클래스가 부모 클래스 타입으로 형변환 하는것!
		
		Animal a2 = new Dog();
		// ex) 강아지는 동물이다 --> 자동으로 형변환이 가능
		// 모든 동물-->
		
		// 만약에 자식클래스가 부모 클래스의 메소드를 재정의(오버랑이딩)한 경우에는 
		// 업캐스팅된 객체가 자식 클래스의 메소드를 호출한다!
		a2.bark();
		
		// 2. DownCating(다운캐스팅)
		// 부모 클래스가 자식 클래스로 형변환 하는 강제 형 변환
		//Dog d2 = (Dog)new Animal();
		
		// 다운캐스팅 -> "업캐스팅이 된" 객체를 강제 형변환으로 되돌리기 위한 것!
		// : 전제조건 -> 업캐스팅이 된 객체!
		
		Dog d3 = (Dog)a2;
		
		// 만약에, 추가로 고양이, 새, 돌고래
		// Dog, cat, Bird, Dolphin
		
		Dog[] hopital = new Dog[5];
		
		Animal[] hopital1 = new Animal[5];
		
		hopital1[0] = new Dog();
		hopital1[1] = new Cat();
		hopital1[2] = new Bird();
		
		
		
		
		
	}

}
