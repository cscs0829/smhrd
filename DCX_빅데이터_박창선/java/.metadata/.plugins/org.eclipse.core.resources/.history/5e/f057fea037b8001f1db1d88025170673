package model;

import java.util.Random;

import java.util.Scanner;

import javazoom.jl.player.MP3Player;

public class science {

	Random rd = new Random();
	Scanner sc = new Scanner(System.in);
	MP3Player mp3 = new MP3Player();
	String patheffect = "C:/Users/smhrd/Desktop/박민지팀/effect/";

	// Hard모드 과학실
	public boolean Hard() {
		boolean success = false;
		try {
			String[] arrayScienceHard = new String[3];
			arrayScienceHard[0] = "Q.왜 하늘은 파랗게 보일까요? \n" + "[1] 대기 중의 산소가 파란색을 흡수하기 때문이다.\n"
					+ "[2] 햇빛이 대기를 통과하면서 파란색이 산란되기 때문이다.\n" + "[3] 지구의 자기장이 파란색 빛을 반사하기 때문이다.\n"
					+ "[4] 대기 중의 먼지가 파란색 빛을 산란시키기 때문이다.\n 답 : ";

			arrayScienceHard[1] = "Q.스마트폰의 배터리 충전이 느려지는 주된 이유는 무엇일까요?\n" + "[1] 배터리의 온도가 너무 낮다.\n"
					+ "[2] 배터리가 오래되어 전압이 낮아졌다.\n" + "[3] 충전 케이블의 저항이 커졌다.\n" + "[4] 스마트폰의 프로세서가 너무 바쁘다.\n 답 : ";

			arrayScienceHard[2] = "Q.다크 초콜릿이 건강에 좋은 이유는 무엇인가요?\n" + "[1] 항산화 성분이 풍부하기 때문이다.\n"
					+ "[2] 칼로리가 낮아서 다이어트에 좋다.\n" + "[3] 카페인이 포함되어 있어 집중력에 좋다.\n" + "[4] 비타민 C가 풍부한다.\n 답 : ";

			System.out.println("==================== 과학실 ====================");
			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("과학실에 들어가보니 작은 상자 하나가 교실 가운데 놓여있고, 앞에는 종이와 펜이있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("종이에는 문제가 적혀있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("잘 모르겠지만 우선 문제를 풀어보자.");
			Thread.sleep(3000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("================= 문제 ====================");

			int num = rd.nextInt(3);
			System.out.print(arrayScienceHard[num]);
			int answer = sc.nextInt();

			if (num == 0) {
				if (answer == 2) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
					Thread.sleep(3000);
					success = true;

				}
			} else if (num == 1) {
				if (answer == 2) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
					Thread.sleep(3000);
					success = true;

				}
			} else if (num == 2) {
				if (answer == 1) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
					Thread.sleep(3000);
					success = true;

				}
			}

		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return success;

	}

	// Easy 모드 과학실
	public boolean Easy() {
		boolean success = false;
		try {
			String[] arrayScienceEasy = new String[3];
			arrayScienceEasy[0] = "Q.지구의 대기에서 가장 많은 비율을 차지하는 기체는 무엇일까요?\n" + "[1] 산소\n" + "[2] 이산화탄소\n" + "[3] 질소\n"
					+ "[4] 아르곤\n 답 : ";
			arrayScienceEasy[1] = "Q.지구에서 가장 깊은 바다는 어디일까요?\n" + "[1] 태평양\n" + "[2] 대서양\n" + "[3] 인도양\n"
					+ "[4] 남극해\n 답 : ";
			arrayScienceEasy[2] = "Q.사람의 평균 체온은 약 몇 도일까요?\n" + "[1] 35.5°c\n" + "[2] 36.5°c\n" + "[3] 37.5°c\n"
					+ "[4] 38.5°c\n 답 : ";

			System.out.println("==================== 과학실 ====================");
			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("과학실에 들어가보니 작은 상자 하나가 교실 가운데 놓여있고, 앞에는 종이와 펜이있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("종이에는 문제가 적혀있다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("잘 모르겠지만 우선 문제를 풀어보자.");
			Thread.sleep(3000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("================= 문제 ====================");

			int num = rd.nextInt(3);
			System.out.print(arrayScienceEasy[num]);
			int answer = sc.nextInt();
			if (num == 0) {
				if (answer == 3) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
					Thread.sleep(3000);
					success = true;

				}
			} else if (num == 1) {
				if (answer == 1) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
					Thread.sleep(3000);
					success = true;

				}
			} else if (num == 2) {
				if (answer == 2) {
					mp3.play(patheffect + "상자.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "열쇠 얻는소리.mp3");
					Thread.sleep(2000);
					mp3.play(patheffect + "키보드.mp3");
					System.out.println("상자를 열어보니 미술이라고 적힌 열쇠가 하나 들어있다. 미술실로 가보자");
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
