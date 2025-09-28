package Model;

// DTO : Data Transfer Object
public class GameDTO {
	
	// 필드 
	private String id;
	private String pw;
	private String name;
	private int age;

	// 회원가입 기능을 위한 생성자 메소드
	public GameDTO(String id, String pw, String name, int age) {
		super();
		this.id = id;
		this.pw = pw;
		this.name = name;
		this.age = age;
	}

	//로그인 기능을 위한 생성자 메소드 + 회원정보 수정 기능을 위한 생성자 메소드
	public GameDTO(String id, String pw) {
		super();
		this.id = id;
		this.pw = pw;
	}
	
	// 메소드(getter/setter, 생성자메소드)
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getPw() {
		return pw;
	}
	public void setPw(String pw) {
		this.pw = pw;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
