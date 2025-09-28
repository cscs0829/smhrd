import java.util.Scanner;

public class Ex30 {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
	      System.out.println("==== 알파벳 빈도수 구하기 ====");
	      System.out.print("입력 >> ");
	      String input_user = sc.nextLine();
	      String[] store = input_user.split("");
	      String[] compareSmall = {"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"};
	      String[] compareLarge = {"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"};
	      int[] cntAalph = new int[26];
	      int cnt = 0;
	      for(int i=0; i<store.length; i++) {
	         for(int j=0; j<26; j++) {
	            if(store[i].equals(compareSmall[j]) || store[i].equals(compareLarge[j])) {
	               cntAalph[j]++;
	            }else {
	               continue;
	            }
	         }
	      }
	      
	      for(int i=0; i<26;i++) {
	         System.out.println(compareSmall[i]+" : "+cntAalph[i]);
	      }

	}

}
