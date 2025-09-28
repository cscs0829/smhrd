package smhrd;

import java.util.Scanner;

public class Ex_sec {

	public static void main(String[] args) {
		
		// 초를 입력 받아(Scanner)
		// ? 시간 ? 분 ? 초 형태로 출력하기
	
		
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("초 입력 : ");
		int totalSecond = sc.nextInt();
		
		// 1시간 = 60초(1분) * 60개 = 3600초
		int hour = totalSecond/3600;
		System.out.print(hour+"시");
		int min = totalSecond/60 - (hour*60);
		System.out.print(min+"분");
		int sec = totalSecond%60;
		System.out.print(sec+"초");
		sc.close();
	
	
	}

}
