import java.util.Scanner;
import java.util.ArrayList;
public class Ex01_team {

	public static void main(String[] args) {
		
		 Scanner sc = new Scanner(System.in);
		 
		 
	
//		 String[] names = new String[4];
//		for(int i=0; i<names.length; i++) {	
//		System.out.print("이름을 입력하세요 : ");
//		names[i] = sc.next();
//			
//		}
//		  System.out.println("연구 개발팀의 팀원은:");
//	        for (int i = 0; i < names.length; i++) {
//	        	System.out.println("연구개발팀의 팀원은 " + names[i]);
//           
//		}System.out.println("연구개발팀의 팀원은 " + names[]);
//	}
//
//}    
		        ArrayList<String> team = new ArrayList<String>();

		        
		        for (int i = 0; i < 4; i++) {
		            System.out.print("이름을 입력하세요 : ");
		            String name = sc.next();
		            team.add(name);
		        }

		        // 팀원 출력
		        System.out.println("연구 개발팀의 팀원은:");
		        for (int i = 0; i < team.size(); i++) {
		            System.out.println(team.get(i));
		        }

		       //팀원 퇴출시키기 
		        System.out.println("탈퇴 인원 : ");
		        String delete = sc.next();
		        
		        // delete 값을 ArrayList의 0번 인텍스 ~마지막 인덱스까지 비교
		        // 만약에 같은 값이 있다면 삭제, 없다면 삭제 x
		        // 마지막에 팀원 출력
		        for (int i = 0; i < team.size(); i++) {

		            if (team.get(i).equals(delete)) {
		               team.remove(i);
		               break;
		            }

		         }

		         // 팀원 출력
		         System.out.print("우리팀 팀원은 ");
		         for (int i = 0; i < team.size(); i++) {
		            System.out.print(team.get(i) + " ");
		         }
		         System.out.println("입니다.");

		      }

		   }


