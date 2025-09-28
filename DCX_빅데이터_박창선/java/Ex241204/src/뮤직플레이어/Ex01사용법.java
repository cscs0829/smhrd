package 뮤직플레이어;

import javazoom.jl.player.MP3Player;

public class Ex01사용법 {

	public static void main(String[] args) {
		
		// jar
		// -> 일종의 java project의 압축파일 : 확장자가 .jar
		// -> 다른 사람이 만들어 놓은 class파일의 모음집
		// -> 라이브러리 
		
		// 노래 재생하기!
		MP3Player mp3 = new MP3Player();
		
		// 절대 경로를 이용해서 노래 재생
		// 절대 경로 : 파일의 위치를 C:
		
		mp3.play("C:\\Users\\smhrd\\Desktop\\player\\음악리스트\\up.mp3");
		mp3.stop();
		mp3.play("C:\\Users\\smhrd\\Desktop\\player\\음악리스트\\Whiplash.mp3");
		System.out.println(mp3.isPlaying());
		
		if(mp3.isPlaying()) {			
		mp3.stop();		
		}
		// 음악이 재생중인지 확인하는 메소드
		System.out.println(mp3.isPlaying());
		
		
		
		
		
		
		
		
		
	}
	
	
}
