package 뮤직플레이어;

import java.util.ArrayList;
import java.util.Scanner;

import javazoom.jl.player.MP3Player;

public class MusicMain {

	public static void main(String[] args) {
		
		// 나만의 MP3플레이어!
		MP3Player mp3 = new MP3Player();
		Scanner sc = new Scanner(System.in);
		
		// 저장해야하는 데이터 ( 노래의 경로, 노래 제목, 가수 이름)
		// 노래를 저장할 수 있는 나만의 music 자료형 만들어주기
		String comPath = "C:\\Users\\smhrd\\Desktop\\player\\음악리스트\\";
		
		
		Music m1 = new Music(comPath+"UP.mp3", "UP", "카리나");
		
		// ArrayList 사용해서 노래 5곡 저장하기
		ArrayList<Music> list = new ArrayList<Music>();
		
		list.add(m1);
		
		list.add(new Music(comPath+"APT.mp3", "APT", "로제"));
		list.add(new Music(comPath+"명동콜링.mp3", "명동콜링", "카더가든"));
		list.add(new Music(comPath+"Whiplash.mp3", "Whiplash", "에스파"));
		list.add(new Music(comPath+"HAPPY.mp3", "HAPPY", "DAY6"));
		
		
		System.out.println("========== 이수의 뮤직 플레이어 ===========");
		int i = 0; // 노래의 재생 인덱스를 기억하는 변수
		
		
		while(true) {
			System.out.println("[1]재생 [2]정지 [3]다음곡 재생 [4]이전곡 재생 [5]종료");
			int choice = sc.nextInt();
		
			if(choice ==1) {
				 // 1. 노래가 실행중인지 확인 -> if 실행중 : 노래를 종료
	            if (mp3.isPlaying()) {
	               mp3.stop();
	            }

	            // 2. 노래를 재생 (노래의 경로)
	            mp3.play(list.get(i).getPath());

	            // 3. 재생 중인 노래의 제목과 가수 이름을 출력
	            // 예) UP - 카리나가 재생중입니다!

	            System.out.println(list.get(i).getTitle() + "-" + list.get(i).getSinger() + " 재생중입니다");
						
			}else if(choice ==2) {
				//노래 정지
				if(mp3.isPlaying()) {
					mp3.stop();
									}
			}else if(choice ==3) {
				// 다음곡 재생
	            // 1. 노래가 재생중인지 확인 -> stop
	            if (mp3.isPlaying()) {
	               mp3.stop();
	            }
	            // 2. 노래를 재생 / 지금 재생되고 있는 노래의 다음 인덱스의 노래가 재생
	            // ex) 0 -> 1 3 -> 4
	            // 4 -> 0 : 노래 재생 x "리스트의 마지막곡입니다"
	            i++;
	            if (i < list.size()) {

	               // 2. 노래를 재생 (노래의 경로)
	               mp3.play(list.get(i).getPath());

	               System.out.println(list.get(i).getTitle() + "-" + list.get(i).getSinger() + " 재생중입니다");
	            } else {
	               // i =>5
	               i = 0;
	               System.out.println("마지막 곡입니다! 처음부터 재생해주세요!");
	            }

			}else if(choice ==4) {
				//이전곡 재생
				//1. 노래가 재생중인지 확인
				if(mp3.isPlaying()){
					mp3.stop();
				}
				i--;
				if(i>=0) {
					mp3.stop();
					System.out.println(list.get(i).getTitle()+ "-"+list.get(i).getSinger()+" 재생중입니다.");
				}else {
					i=0;
					System.out.println("이전곡이 없습니다! 처음부터 재생해주세요!");
				}
				
			}else if(choice ==5) {
				//종료
				System.out.println("종료");
				mp3.stop();
				break;
			}
		
		
		
		
		
		}
		
	
	
	
	
	}

}
