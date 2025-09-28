package poke;

public class pokemon {

	
	// 포켓몬 설계도 클래스
	// 1. 필드 
	
	private String name; // 이름
	private String type; // 속성, 타입
	private int hp; // 생명력
	private int atk; // 공격력
	private String skill;// 스킬
	 // 스킬
	
	// 2. 메소드
	
	//getter, setter 메소드
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	public int getHp() {
		return hp;
	}
	
	public void setHp(int hp) {
		this.hp = hp;
	}
	
	public int getAtk() {
		return atk;
	}
	
	public void setAtk(int atk) {
		this.atk = atk;
	}
	
	public String getSkill() {
		return skill;
	}
	
	public void setSkill(String skill) {
		this.skill = skill;
	}
	
	
	// 생성자 메소드
	
	public pokemon(String name, String type, int hp, int atk, String skill) {
		super();
		this.name = name;
		this.type = type;
		this.hp = hp;
		this.atk = atk;
		this.skill = skill;
	
	
	
	
		
	
	
	
}

}
