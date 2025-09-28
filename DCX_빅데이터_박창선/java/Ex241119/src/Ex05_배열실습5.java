import java.util.Arrays;

public class Ex05_배열실습5 {

    public static void main(String[] args) {
        
        String score = "A,A,B,C,D,A,C,D,D,D,F";
        
        String[] array = score.split(",");
        System.out.println(Arrays.toString(array));
        // 성적의 개수를 저장할 변수
        int cntA = 0;
        int cntB = 0;
        int cntC = 0;
        int cntD = 0;
        int cntF = 0;
        
        // 배열을 순회하면서 각 성적을 계산
        for (int i = 0; i < array.length; i++) {
            if (array[i].equals("A")) {
                cntA++;
            } else if (array[i].equals("B")) {
                cntB++;
            } else if (array[i].equals("C")) {
                cntC++;
            } else if (array[i].equals("D")) {
                cntD++;
            } else if (array[i].equals("F")) {
                cntF++;
            }
        }
        
        
        System.out.println("A: " + cntA + "명");
        System.out.println("B: " + cntB + "명");
        System.out.println("C: " + cntC + "명");
        System.out.println("D: " + cntD + "명");
        System.out.println("F: " + cntF + "명");
    }
}
