import java.util.Scanner;

public class Ex25 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);

        System.out.print("첫자리 0을 제외한 숫자를 입력해주세요 >>");

        int num = sc.nextInt();

        System.out.println(toNum(num));

    }

    

    public static int toNum(int num) {

        int result = 0;

        //숫자별 - 개수

        int[] nums = {6, 2, 5, 5, 4, 5, 6, 3, 7, 6};

        while(num>0) {

            int num2 = num%10; //10의자리에서 남은숫자 구하기

            num /= 10; // 맨뒷자리부터 10의 단위로 숫자 삭제하기

            result+=nums[num2]; // 배열과 10의자리 수를 비교해서 - 구해서 합하기

        }

        return result;

    }

}
