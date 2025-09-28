package 뮤직플레이어;

public class Music {

	// 뮤직 플레이어 안에서 사용하는 나만의 음악 자료형
	
	// 1. 필드 
	// private 3개(path - 경로, title - 노래 제목, singer - 가수 이름)
	private String path;
	private String title;
	private String singer;
	
	// 2. 메소드 
	// 2-1 생성자 (모든(3) 필드를 채워주는 생성자)
	public Music(String path, String title, String singer) {
		super();
		this.path = path;
		this.title = title;
		this.singer = singer;
	}
	// 2-2 모든 필드 getter 메소드 
	public String getPath() {
		return path;
	}

	public String getTitle() {
		return title;
	}

	public String getSinger() {
		return singer;
	}
	
	
	
		
}
