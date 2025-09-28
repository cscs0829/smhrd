package Ex00_이차원배열;

public class hrd {

	public static void main(String[] args) {
		
// 이차원배열 선언 및 생성
// 자료형[][] 배열이름 = new 자료형[행][열];
// 자료형[][] 배열이름 = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
					// {4, 5, 6},
					// {7, 8, 9} };
		
// 학생 3명의 국, 영, 수 ,사 과 점수를 저장할 수 있는 배열을 생성
		int[][] allStu = {	{80, 40, 90, 55, 100} , 
							{70, 44, 18, 47, 64} , 
							{80, 11, 43, 58, 99}};
		
		
		System.out.print(0 + "번 학생 : ");
		int sum = 0; //0번째 학생의 점수를 누적해줄 변수
		
		for(int i = 0; i < 5; i++) {
			sum += allStu[0][i]; // 80
			
		}
		System.out.println(sum);
		//-------------------------------------
		System.out.print(1 + "번 학생 : ");
		int sum1 = 0; //0번째 학생의 점수를 누적해줄 변수
		
		for(int i = 0; i < 5; i++) {
			sum1 += allStu[1][i]; // 80
			
		}
		System.out.println(sum1);
		//------------------------------------------
		System.out.print(2 + "번 학생 : ");
		int sum2 = 0; //0번째 학생의 점수를 누적해줄 변수
		
		for(int i = 0; i < 5; i++) {
			sum2 += allStu[2][i]; // 80
			
		}
		System.out.println(sum2);
		//--------------------------------------
		System.out.print("총점 : ");
		int tol = sum+sum1+sum2;
		System.out.println(tol);
		//=======================================
		System.out.print("모든 학생의 총합 : ");
		int sum3 = 0; //0번째 학생의 점수를 누적해줄 변수
		
		for(int i = 0; i < allStu[0].length; i++) {
			for(int j=0; j< allStu.length; j++) {
				sum3 += allStu[j][i]; // 80
			}
			
		}
		System.out.println(sum3);
		
		
		for(int j = 0; j < allStu.length; j++) {
    
		System.out.print(j + "번 학생 : ");
		int sum4 = 0; // 0번째 학생의 점수를 누적해줄 변수
		for(int i = 0; i < allStu[j].length; i++) {
			sum4 += allStu[j][i];
    }
		System.out.println(sum + "/ 평균 : " + (double)sum4/allStu[j].length);
    
 }

		
//		sum += allStu[0][0]; // 80
//		sum += allStu[0][1]; // 125
//		sum += allStu[0][2]; // 215
//		sum += allStu[0][3]; // 270
//		sum += allStu[0][4]; // 370
		
		
		
		
		
		
		// step1. 모든 학생의 총 점수 출력하기
		// step2. 각 학생의 평균 점수도 출력하기
		// 0번학생 : 0번과목 ~ 4번과목 
		// 1번학생 : 0번과목 ~ 4번과목 
		// 2번학생 : 0번과목 ~ 4번과목 
		
		
		
		
		
		
		

	}

}
