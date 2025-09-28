package smhrd;

import java.util.Scanner;

public class Ex19_fan {

	public static void main(String[] args) {
		//int 타입의 fan을 키보드로 입력받으세요
		Scanner sc = new Scanner(System.in);
		
		System.out.println("선풍기의 풍속을 선택하세요.");
		System.out.println("1.약 2.중 3.강");
		int fan = sc.nextInt();
		
		switch (fan) {
		case 1:
			System.out.println("약풍입니다");
			break;
		case 2:
			System.out.println("중풍입니다");
			break;
		case 3:
			System.out.println("강풍입니다");
			break;
		default:
			System.out.println("잘못 누르셨습니다");
			break;
		}
		
		
		
		
		
		
		

	}

}
