import javazoom.jl.player.MP3Player;

public class 실험 {

	public static void main(String[] args) {
		MP3Player mp3 = new MP3Player();
		
		String patheffect = "./src/효과음/";
		
		mp3.play(patheffect+"학교배경음.mp3");
		mp3.play(patheffect+"천둥효과음.mp3");
		mp3.stop();
	}

}
