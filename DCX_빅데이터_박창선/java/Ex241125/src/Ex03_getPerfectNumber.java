public class Ex03_getPerfectNumber {

    public static void main(String[] args) {
        int startValue = 2; // 시작값
        int endValue = 1000; // 끝값
        System.out.print("2 ~ 1000까지의 완전수: ");
        getPerfectNumber(startValue, endValue); 
    }

    public static void getPerfectNumber(int startValue, int endValue) {
        
        for(int j = startValue; j <= endValue; j++) {
           int sum = 0;
           for(int i = 1; i < j; i++) {
              if(j % i == 0) {
                 // 2의 약수
                 sum += i;
              }
           }
           if(sum == j) {
              System.out.print(j + " ");
           }
        }
}
}