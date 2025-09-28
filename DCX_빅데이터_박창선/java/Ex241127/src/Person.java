

public class Person {

    // 사람을 만들 수 있는 '설계도' 클래스

    // 1. 필드 (field) -> 속성, 데이터
    public String name;  // 이름
    int age;      // 나이
    String gender; // 성별
    
    
    // 생성자 메소드
    // 1. 메소드 이름은 클래스 이름이랑 동일
    // 리턴타입 없음(void 자체도 없음)
    
    public Person(String name, int age, String gender) {
    	super();
    	this.name = name;
    	this.age = age;
    	this.gender = gender;
    }
    
    public Person(String name, int age) {
    	super();
    	this.name = name;
    	this.age = age;
    }
    
    // 기본 생성자 메소드
    // 1. 다른 생성자 메소드를 만들지 않으면 기본적으로 존재한다
    // 2. 객체 생성 시 생성자가 없는 경우 자동으로 생성
    public Person() {
    	
    }



	//2. 메소드 -> 기능, 행동, 행위
    // 잠자기, 말하기, 코딩하기...
    // main() 가 없는 클래스에서는 static 키워들 쓰지 않음
    public void sleep() {
        System.out.println("쿨쿨 잠자기... ZZZZZZ");
    }

	

	public void talk() {
        System.out.println("재잘재잘 말하기!!");
    }

    public void coding() {
        System.out.println("열심히 코딩하기~~");
    }
}
