public class Ex01_주소공유 {

    public static void main(String[] args) {

        // 배열 -> 레퍼런스 변수 -> 주소값 저장
        // 주소값 공유 -> 같은 공간을 공유

        int[] intArray = new int[5]; // 0 ~ 4
        int[] myArray = intArray;

        System.out.println(intArray);
        System.out.println(myArray);

        // 개별 값 할당
        intArray[0] = 1;
        intArray[1] = 2;
        intArray[2] = 3;

        System.out.println(intArray[1]); // 2
        System.out.println(myArray[1]); // 2

        myArray[1] = 8;

        System.out.println(intArray[1]); // 8
        System.out.println(myArray[1]); // 8
    }
}
