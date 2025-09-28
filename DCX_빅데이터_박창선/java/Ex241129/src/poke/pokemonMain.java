package poke;

public class pokemonMain {

	public static void main(String[] args) {
		
		// 1.객체를 담을 수 있는 배열
		// 데이터타입[] 변수명 = new 데이터타입[크기];
		pokemon[] bag = new pokemon[3];
		
		// 객체 배열의 0번 인덱스에 들어있는 데이터 출력
		System.out.println(bag[0]);
		
		// 객체 배열의 0번 인덱스에 포켓몬을 넣어보기!
		// 이름 : 피카츄, 속성 : 전기, hp : 100, 공경력 : 100, 스킬 : 백만볼트
		bag[0]=new pokemon("피카츄", "전기", 100, 100, "백만볼트");
		//System.out.println(bag[0].getName());
		bag[1]=new pokemon("잠만보", "노말", 200, 50, "배치기");
		bag[2]=new pokemon("꼬부기", "물", 50, 150, "물대포");
		
		//배열 안에 있는 포켓몬들의 이름, 타입, hp 출력
		//형식
		// ==== 포켓몬 정보 출력 ====
		// 1) 피카츄 전기 100
		// 2) 파이리 불 80
		// 3) 꼬부기 물 50
		System.out.println("==== 포켓몬 정보 출력 ====");
		
		for (int i = 0; i < bag.length; i++) {
            System.out.println(bag[i].getName() + " " + bag[i].getType() + " " + bag[i].getHp());
        }
		
		// 확장 for문(for-each문)
		// for( 변수 선언 : 배열(List) )
		int i = 1;
		for( pokemon p:  bag ) {
	            System.out.println((i++) + ")" + p.getName() + " " + p.getType() + " " + p.getHp());
		}// p는 변수 선언
		
		
		
		
		
		

	}

}
