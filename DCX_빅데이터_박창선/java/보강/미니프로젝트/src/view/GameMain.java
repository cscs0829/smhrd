package view;

import java.util.Scanner;

import controller.GameCon;
import javazoom.jl.player.MP3Player;
import model.UserDAO;
import model.art;
import model.computer;
import model.music;
import model.science;

public class GameMain {

	public static void main(String[] args) {
		MP3Player mp3 = new MP3Player();
		Scanner sc = new Scanner(System.in);
		GameCon gc = new GameCon();
		UserDAO dao = new UserDAO();
		science science = new science();
		computer computer = new computer();
		music music = new music();
		art art = new art();
		String patheffect = "./src/효과음/";

		while (true) {
			System.out.print("[1] 회원가입 [2] 로그인 [3] 종료 >> ");
			int menu = sc.nextInt();

			if (menu == 1) {
				// 회원가입
				System.out.print("ID : ");
				String id = sc.next();
				System.out.print("PW : ");
				String pw = sc.next();
				System.out.print("NAME : ");
				String name = sc.next();

				gc.joinCon(id, pw, name);

			} else if (menu == 2) {
				// 로그인
				System.out.print("ID : ");
				String id = sc.next();
				System.out.print("PW : ");
				String pw = sc.next();

				if (gc.loginCon(id, pw)) {
					mp3.play(patheffect + "게임버튼.mp3");
					System.out.println("로그인 성공!");
					break;
				} else {
					System.out.println("로그인 실패.. 다시 입력해주세요!\n");
				}

			} else if (menu == 3) {
				// 종료
				break;
			} else {
				System.out.println("잘못입력하셨습니다.. 다시 입력해주세요!");
			}

		}
		try {
			Thread.sleep(3000);
			mp3.play(patheffect + "키보드.mp3");
			System.out.println("===========================지난 이야기===========================\n"
					+ "학원을 마치고 집에 돌아온 강씨는 여자친구 미미를 학교에 두고온 걸 뒤늦게 깨닳았다");
			Thread.sleep(2000);
			mp3.play(patheffect + "키보드.mp3");
			System.out.println("지금은 새벽 1시.... 하지만 미미를 학교에 쓸쓸히 두고 잠에 들 순 없다.....");
			Thread.sleep(2000);
			mp3.play(patheffect + "키보드.mp3");
			System.out.println("부랴부랴 겉옷을 챙겨입고 집을 나선다.....");
			Thread.sleep(4000);
			mp3.play(patheffect + "천둥효과음.mp3");
			mp3.play(patheffect + "배경음.mp3");
			gc.start();
			Thread.sleep(2000);

		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// 난이도 설정
		try {
			mp3.play(patheffect + "키보드.mp3");
			System.out.print("😱난이도 설정 : [1] Easy [2] Hard >> ");
			int level = sc.nextInt();
			mp3.play(patheffect + "키보드.mp3");
			if (level == 1) {
				System.out.println("Easy 난이도를 선택하셨습니다.");
				Thread.sleep(2000);
			} else {
				System.out.println("Hard 난이도를 선택하셨습니다.");
				Thread.sleep(2000);
			}
			mp3.play(patheffect + "키보드.mp3");
			System.out.println("학교에 들어갑니다....");
			Thread.sleep(3000);

			mp3.play(patheffect + "교문들어갈때.mp3");
			Thread.sleep(16000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("학교에 들어온 강씨는 교실로 곧장 뛰어가서 문을 열었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "덜컹거리는소리.mp3");
			Thread.sleep(4000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("하지만 교실문은 잠겨있다.....");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("주변을 둘러보니 열려있는 곳은 과학실뿐이다. 들어가보자");
			Thread.sleep(3000);

			while (true) {
				if (level == 1) {
					if (science.Easy()) {
						if (art.Easy()) {
							if (music.Easy()) {
								if (computer.Easy()) {
									break;
								} else {
									gc.fail();
									break;
								}
							} else {
								gc.fail();
								break;
							}
						} else {
							gc.fail();
							break;
						}
					} else {
						gc.fail();
						break;
					}

				} else if (level == 2) {

					if (science.Hard()) {
						if (art.Hard()) {
							if (music.Hard()) {
								if (computer.Hard()) {
									break;
								} else {
									gc.fail();
									break;
								}
							} else {
								gc.fail();
								break;
							}
						} else {
							gc.fail();
							break;
						}
					} else {
						gc.fail();
						break;
					}
				}

			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		// 엔딩
		try {
			 System.out.println("==================== 교실 ====================");
			mp3.play(patheffect + "자물쇠2.mp3");
			Thread.sleep(2000);

			mp3.play(patheffect + "문여는소리.mp3");
			Thread.sleep(6000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("서둘러 교실에 들어와서 미미를 찾았다. 다행히 미미는 서랍속에 잘 있었다.");
			Thread.sleep(2000);

			mp3.play(patheffect + "키보드.mp3");
			System.out.println("보고싶었어 미미짱....빨리 집에 들어가자!!");

			Thread.sleep(4000);
			mp3.play(patheffect + "여자웃음소리.mp3");
			gc.ending();

			Thread.sleep(3000);
			if (mp3.isPlaying()) {
				mp3.stop();
			}
			System.out.println("\n\n\n\n축하합니다!! 게임을 클리어하셨습니다!!!");

		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
}
