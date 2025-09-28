import java.util.ArrayList;
import java.util.Scanner;

public class Ex02_musicPlayList {

	public static void main(String[] args) {

System.out.println("=======Music Play List=======\n");

Scanner sc = new Scanner(System.in);
ArrayList<String> musiclist = new ArrayList<String>();
	//while문 사용해서 menu 변수에 입력받아서 저장 
	//menu가 1이라면 노래추가 기능
	//menu가 2이라면 노래조회 기능
	//menu가 3이라면 노래삭제 기능
	//menu가 4이라면 종료 ->while문 탈출
	int index = 0;
	while(true) {
		
		System.out.println("[1] 노래 추가 [2] 노래 조회 [3] 노래 삭제 [4] 종료 >> ");
		int num = sc.nextInt();
        if(num==1) {
        	System.out.println("==========================");
              System.out.print("[1]원하는 위치에 추가 [2]마지막 위치에 추가 >> "); 
              int num1 = sc.nextInt();
              if(num1 ==1) {
            	  //원하는 위치에 추가 -> .add(index, data)
            	  System.out.print("원하는 위치 : ");
            	  index = sc.nextInt();
            	  System.out.print("추가할 노래 :");
            	  String title = sc.next();
            	  musiclist.add(index-1, title);

            	  
              }else {
            	  System.out.println("추가할 노래 :");
            	  String title = sc.next();
                  musiclist.add(title);
              }
              
              // .add(원하는 인덱스, 원하는 문구), .add(원하는 문구)
             
        }else if(num==2) {
        //노래조회
        	if(musiclist.size()==0) {
        		System.out.println("재생목록이 없습니다!");
        	}else {
	        for (int i = 0; i < musiclist.size(); i++) {
	            System.out.println(i+1 +". "+musiclist.get(i));
	        }
        }
	        }if(num ==3 ) {
        	System.out.println("[1]부분삭제 [2] 전체삭제");
        	int num2 = sc.nextInt();
        	if(num2 == 1) {
        		System.out.println("삭제할 번호 : ");
    	        index = sc.nextInt();
    	        musiclist.remove(index-1);
    	        System.out.println("삭제되었습니다");
        	}else if(num2 ==2){
    	        	musiclist.clear();
    	        	System.out.println("노래가 전체 삭제되었습니다");
    	        	
    	        }
        	
	        
        }if(num == 4) {
        System.out.println("종료");
        break;
        }
        }

	

	}
	}
	
	


