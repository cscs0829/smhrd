package serch;

public class Ex01_sequentialSearch {

	public static void main(String[] args) {
		
		int[] array = {13, 35,15,11,26,72,78,19,61,90};
		int num = 0;
		// 찾고싶은 데이터
		int search = 78;
		
		// 쉬운방법이지만 효율성이 떨어진다
		// 78은 ? 번 인덱스에 있습니다. 출력
		for(int i=0; i <10; i++) {
			if(array[i]==search) {
				num+=i;
				System.out.print(array[i]+"은 " +num+"번 인덱스에 있습니다." );
			
			
			}
				
		}
	
	}
		
		
	}


