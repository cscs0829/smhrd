
public class EX03 {
public static void main(String[] args) {
	
	int sum = 0;
	
	for(int i=1;i<=100;i++) { //1~100까지 반복
		if(i%2==1) { //홀수
			sum += i;
			System.out.print(i+" ");
		}else if(i%2==0) { //짝수
			sum -= i;
			System.out.print(-i+" ");
		}else {
			
		}
	
	}System.out.println();
	System.out.println("결과 : "+sum);
}
}

