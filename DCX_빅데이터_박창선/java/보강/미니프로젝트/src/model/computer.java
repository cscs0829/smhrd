package model;

import java.util.Random;

import java.util.Scanner;

import javazoom.jl.player.MP3Player;

public class computer {

	Random rd = new Random();
	Scanner sc = new Scanner(System.in);
	String patheffect = "./src/효과음/";
	MP3Player mp3 = new MP3Player();

	// Hard모드 과학실
	public boolean Hard() {
		boolean sucess = false;
		try {
			String[] arraycomputerHard = new String[3];
			arraycomputerHard[0] = "Q.컴퓨터 네트워크의 'IP'는 무엇의 약어인가요?\n" + "[1] Internet Process\n"
					+ "[2] Internal Protocol\n" + "[3] Internet Protocol\n" + "[4] Internet Processor\n 답 : ";
			arraycomputerHard[1] = "Q.JDBC를 이용하여 데이터베이스에 연결할 때 필요한 클래스는?\n" + "[1] DriverManager\n" + "[2] Connection\n"
					+ "[3] ResultSet\n" + "[4] Statement\n 답 : ";
			arraycomputerHard[2] = "Q.객체지향 프로그래밍의 3대 요소가 아닌 것은?\n" + "[1] 캡슐화\n" + "[2] 상속\n" + "[3] 다형성\n"
					+ "[4] 일관성\n 답 : ";

			System.out.println("==================== 컴퓨터실 ====================");
			mp3.play(patheffect + "자물쇠2.mp3");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("📢자물쇠로 컴퓨터실🖥️ 문을 열었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("컴퓨터실🖥️에는 낡은 컴퓨터 한 대가 있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("컴퓨터앞에 앉으니 서서히 글자가 써내려진다...");
			Thread.sleep(3000);

			System.out.println("================= 컴퓨터실 문제 ====================");
			int num = rd.nextInt(3);
			System.out.print(arraycomputerHard[num]);
			int answer = sc.nextInt();
			if (num == 0) {
				if (answer == 3) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;
				}
			} else if (num == 1) {
				if (answer == 1) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;
				}
			} else if (num == 2) {
				if (answer == 4) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;
				}
			}
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return sucess;

	}

	// Easy 모드 과학실
	public boolean Easy() { // 주소값만 가지고 있는 레퍼런스 변수
		boolean sucess = false;
		try {
			String[] arraycomputerEasy = new String[3];
			arraycomputerEasy[0] = "Q.자바의 기본 데이터 타입 중에서 4바이트를 차지하는 타입은 무엇인가요?\n" + "[1] byte\n" + "[2] short\n"
					+ "[3] int\n" + "[4] double\n 답 : ";
			arraycomputerEasy[1] = "Q.자바에서 객체 지향 프로그래밍의 4대 원칙이 아닌 것은 무엇인가요?\n" + "[1] 캡슐화 (Encapsulation)\n"
					+ "[2] 상속 (Inheritance)\n" + "[3] 다형성 (Polymorphism)\n" + "[4] 인터페이스 (Interface)\n 답 : ";
			arraycomputerEasy[2] = "Q.자바에서 String 클래스의 equals() 메소드의 사용 목적은 무엇인가요?\n" + "[1] 두 객체의 메모리 주소를 비교한다.\n"
					+ "[2] 두 문자열 객체의 내용을 비교한다.\n" + "[3] 두 문자열 객체의 크기를 비교한다.\n" + "[4] 두 문자열 메모리 내용을 비교한다.\n 답 : ";

			System.out.println("==================== 컴퓨터실 ====================");
			mp3.play(patheffect + "자물쇠2.mp3");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("📢자물쇠로 컴퓨터실🖥️ 문을 열었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("컴퓨터실🖥️에는 낡은 컴퓨터 한 대가 있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("컴퓨터앞에 앉으니 서서히 글자가 써내려진다...");
			Thread.sleep(3000);

			System.out.println("================= 컴퓨터실 문제 ====================");
			int num = rd.nextInt(3);
			System.out.print(arraycomputerEasy[num]);
			int answer = sc.nextInt();
			if (num == 0) {
				if (answer == 3) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;

				}
			} else if (num == 1) {
				if (answer == 4) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;

				}
			} else if (num == 2) {
				if (answer == 2) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 교실이라고 적힌 열쇠가 하나 들어있다. 마지막으로 교실에 가보자.");
					Thread.sleep(3000);
					sucess = true;
				}
			}

		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return sucess;
	}
}