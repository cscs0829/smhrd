
public class Student {
	
	
	
	
	public String name;  // 이름
	int num;			//학번
    int age;      		// 나이
    int java;			// 자바 점수
    int web;			// 웹 점수
    int and;			// 안드로이드 점수
	
    public Student() {
        // 기본 값 설정
        this.name = "";
        this.num = 0;
        this.age = 0;
        this.java = 0;
        this.web = 0;
        this.and = 0;
    }
    public void show() {
    	
    }
    
    public Student(String name, int num, int age, int java, int web, int and) {
		super();
		this.name = name;
		this.num = num;
		this.age = age;
		this.java = java;
		this.web = web;
		this.and = and;
		
		
		
	
	}

    
    
    
    
    
    
}
