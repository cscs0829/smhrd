import java.util.ArrayList;

public class Ex05_ArrayList {

	public static void main(String[] args) {
		
		// 1. 선언
		// 배열
		int[] arr = new int[5];
		
		// Arraylist
		// 제네릭기법
		// import 해야함
		// ArrayList<데이터타입> 변수명 = new Arraylist<데이터타입>
		ArrayList<Integer> arrayList = new ArrayList<Integer>();
		
		// 2. 크기 
		System.out.println("배열이 크기 : "+ arr.length);
		System.out.println("ArrayList의 크기 : "+ arrayList.size());
		
		// 3. 값 추가 
		// 배열 
		arr[0] = 12334;
		arr[1] = 132434;
		arr[2] = 111;
		arr[3] = 122;
		arr[4] = 123;
		
		
		//ArrayList
		//변수명.add(값) ->순차적으로 값이 저장
		//변수명.add(인덱스번호, 값) -> 원하는 위치에 값 저장
		arrayList.add(1);
		arrayList.add(2);
		arrayList.add(3);
		
		arrayList.add(4);
		arrayList.add(5);
		
		arrayList.add(1, 6);
		
		System.out.println("ArrayList의 크기 : "+ arrayList.size());
		
		// 4. 값 조회
		// 배열 -> 변수명[인덱스번호]
		System.out.println("배열의 0번 인덱스 : " + arr[0]);
		
		
		//반복문(for문)을 사용해서 ArrayList값 모두 출력
		
		for(int i = 0; i < arrayList.size(); i++) {
			System.out.print(arrayList.get(i)+ " ");
		}
		System.out.println("\nArrayList의 0번 인덱스 " + arrayList.get(1));
		// 5. 값 삭제
		// 원하는 인덱스 값 삭제 
		// 모든 값 삭제 
		arrayList.remove(1);
		
		for(int i = 0; i < arrayList.size(); i++) {
			System.out.print(arrayList.get(i)+ " ");
		}
		
		arrayList.clear();
		
		System.out.println("ArrayList의 크기 : "+ arrayList.size());
		
		
		
		
		

	}

}
