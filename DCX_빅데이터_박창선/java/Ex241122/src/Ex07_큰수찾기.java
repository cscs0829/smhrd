public class Ex07_큰수찾기 {

    public static void main(String[] args) {

        int num1 = 10;
        int num2 = 24;
        int result = largerNumbers(num1, num2);
        System.out.println("큰 수 확인: " + result);
    } 

    public static int largerNumbers(int num1, int num2) {
        int result = 0; // 초기화
        if (num1 > num2) {
            result = num1; 
        } else {
            result = num2; 
        }
        return result; // 결과 반환
    }
}
