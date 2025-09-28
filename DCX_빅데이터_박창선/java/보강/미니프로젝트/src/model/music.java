package model;

import java.io.FileInputStream;

import java.io.InputStream;
import java.util.Random;

import java.util.Scanner;

import javazoom.jl.player.MP3Player;
import javazoom.jl.player.Player;
import javazoom.jl.player.advanced.AdvancedPlayer;

public class music {

	Random rd = new Random();
	Scanner sc = new Scanner(System.in);
	String pathmusic = "./src/음악문제/";
	String patheffect = "./src/효과음/";
	MP3Player mp3 = new MP3Player();

	private AdvancedPlayer player;
	private Thread musicThread;

	// Hard모드 스레드
	public void playMusicHard(String selectedMusicFile) {
		musicThread = new Thread(() -> {
			try (FileInputStream fileInputStream = new FileInputStream(selectedMusicFile)) {
				player = new AdvancedPlayer(fileInputStream);
				player.play();
			} catch (Exception e) {
				e.printStackTrace();
			}
		});

		musicThread.start(); // 음악 스레드 시작
	}

	public void stopMusicHard(String selectedMusicFile) {
		if (selectedMusicFile != null) {
			player.close();
		}
		if (musicThread != null && musicThread.isAlive()) {
			musicThread.interrupt(); // 스레드 종료 요청
		}
	}

	// Hard모드 음악실
	public boolean Hard() {
		boolean success = false;
		try {
			String[] arrayMusicHard = new String[3];
			arrayMusicHard[0] = pathmusic + "사랑은 늘 도망가.mp3";
			arrayMusicHard[1] = pathmusic + "오늘도빛나는너에게.mp3";
			arrayMusicHard[2] = pathmusic + "취중고백.mp3";

			System.out.println("==================== 음악실 ====================");
			mp3.play(patheffect + "자물쇠2.mp3");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("📢자물쇠로 음악실🎹 문을 열었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("음악실🎹에는 작은 스피커가 있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("스피커의 전원을 켜보니 음악이 들려온다...");
			Thread.sleep(3000);

			// 랜덤으로 음악 파일 선택
			int num = rd.nextInt(arrayMusicHard.length);
			String selectedMusicFile = arrayMusicHard[num];

			System.out.println("================= 음악실 문제 ====================");
			System.out.println("Q.노래 제목을 띄어쓰기 없이 입력하세요.");
			Thread.sleep(2000);
			System.out.println("(노래 ON)");

			playMusicHard(selectedMusicFile);
			System.out.print("정답 : ");
			String answer = sc.next();
			stopMusicHard(selectedMusicFile);

			if (num == 0) {
				if (answer.equals("사랑은늘도망가")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			} else if (num == 1) {
				if (answer.equals("오늘도빛나는너에게")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			} else if (num == 2) {
				if (answer.equals("취중고백")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			}

		} catch (InterruptedException e) {
			e.printStackTrace();
		}

		return success;
	}

	// Easy모드 스레드
	public void playMusicEasy(String selectedMusicFile) {
		musicThread = new Thread(() -> {
			try (FileInputStream fileInputStream = new FileInputStream(selectedMusicFile)) {
				player = new AdvancedPlayer(fileInputStream);
				player.play();
			} catch (Exception e) {
				e.printStackTrace();
			}
		});

		musicThread.start(); // 음악 스레드 시작
	}

	public void stopMusicEasy(String selectedMusicFile) {
		if (selectedMusicFile != null) {
			player.close();
		}
		if (musicThread != null && musicThread.isAlive()) {
			musicThread.interrupt(); // 스레드 종료 요청
		}
	}

	// Easy 모드 음악실
	public boolean Easy() {
		boolean success = false;
		try {
			String[] arrayMusicEasy = new String[3];
			arrayMusicEasy[0] = pathmusic + "아로하.mp3";
			arrayMusicEasy[1] = pathmusic + "시작.mp3";
			arrayMusicEasy[2] = pathmusic + "꽃.mp3";

			System.out.println("==================== 음악실 ====================");
			mp3.play(patheffect + "자물쇠2.mp3");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("📢자물쇠로 음악실🎹 문을 열었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("음악실🎹에는 작은 스피커가 있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("스피커의 전원을 켜보니 음악이 들려온다...");
			Thread.sleep(3000);

			// 랜덤으로 음악 파일 선택
			int num = rd.nextInt(arrayMusicEasy.length);
			String selectedMusicFile = arrayMusicEasy[num];

			System.out.println("================= 음악실 문제 ====================");
			System.out.println("Q.노래 제목을 띄어쓰기 없이 입력하세요.");
			Thread.sleep(2000);
			System.out.println("(노래 ON)");

			playMusicEasy(selectedMusicFile);
			System.out.print("정답 : ");
			String answer = sc.next();
			stopMusicEasy(selectedMusicFile);

			if (num == 0) {
				if (answer.equals("아로하")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			} else if (num == 1) {
				if (answer.equals("시작")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			} else if (num == 2) {
				if (answer.equals("꽃")) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 컴퓨터라고 적힌 열쇠가 하나 들어있다. 컴퓨터실로 가보자");
					Thread.sleep(3000);
					success = true;
				}
			}

		} catch (InterruptedException e) {
			e.printStackTrace();
		}

		return success;
	}

}
