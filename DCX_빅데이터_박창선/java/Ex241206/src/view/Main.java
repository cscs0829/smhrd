package view;

import java.util.Scanner;

import model.MeberDAO;
import model.MemberDTO;

public class Main {

	public static void main(String[] args) {
		
		
		// 사용자 눈에 보이는 view 화면 
		// [1]로그인 [2]회원가입 [3]정보수정 [4]전체조회 [5]회원탈퇴 [6]종료 >>
		// scanner를 사용해서 menu 변수에 정수를 입력받아 
		// while문 사용해서 6번을 선택하면 탈출
		
		Scanner sc = new Scanner(System.in);
		MeberDAO dao = new MeberDAO();
		MemberDTO dto = null; 
		
		

		
		while(true) {
			System.out.print("[1]로그인 [2]회원가입 [3]정보수정 [4]전체조회 [5]회원탈퇴 [6]종료 >>");
			int menu = sc.nextInt();
			
			if(menu==1) {
				//로그인
				System.out.print("ID : ");
				String id = sc.next();
				System.out.print("PW : ");
				String pw = sc.next();
				
				dto = new MemberDTO(id, pw);
				int result = dao.login(dto);
				
				if(result > 0) {
					System.out.println("로그인 성공!");
				}else {
					System.out.println("로그인 실패!");
				}
				
			}else if(menu==2) {
				//회원가입
				System.out.println("ID : ");
				String id = sc.next();
				System.out.println("PW : ");
				String pw = sc.next();
				System.out.println("NAME : ");
				String name = sc.next();
				System.out.println("AGE : ");
				int age = sc.nextInt();
			
				dto = new MemberDTO(id, pw, name, age);
				int cnt = dao.join(dto);
				
				if(cnt ==1) {
					System.out.println(name + "님 회원가입 성공!");
				}else {
					System.out.println(name + "님 회원가입 실패!");
					
				}
				
			}else if(menu==3) {
                // 정보수정
                System.out.print("수정할 회원의 ID: ");
                String id = sc.next();
                System.out.print("비밀번호를 입력하세요: ");
                String pw = sc.next();

                dto = new MemberDTO(id, pw);
                int valid = dao.login(dto);

                if (valid > 0) {
                    System.out.println("로그인 성공! 회원정보를 수정하세요.");

                    System.out.print("새로운 NAME: ");
                    String name = sc.next();
                    System.out.print("새로운 AGE: ");
                    int age = sc.nextInt();

                    // 수정할 정보를 포함한 DTO 생성
                    dto = new MemberDTO(id, pw, name, age);

                    // 정보 수정 DAO 호출
                    int cnt = dao.update(dto);
                    if (cnt > 0) {
                        System.out.println("회원정보 수정 성공!");
                    } else {
                        System.out.println("회원정보 수정 실패!");
                    }
                } else {
                    System.out.println("ID 또는 비밀번호가 올바르지 않습니다.");
                }
			
			}else if(menu==4) {
				//전체조회
				dao.memberList();
				
				
			}else if(menu==5) {
				//회원탈퇴
				// 정보수정
                System.out.print("ID: ");
                String id = sc.next();
                System.out.print("PW: ");
                String pw = sc.next();

                dto = new MemberDTO(id, pw);
                int valid = dao.login(dto);

                if (valid > 0) {
                    System.out.println("회원정보 탈퇴 성공!");
                } else {
                    System.out.println("회원정보 탈퇴 실패");
                }
                
			}else if(menu==6) {
				//종료
				System.out.println("프로그램 종료!");
				break;
			}else {
				System.out.println("번호를 다시 골라주세요!");
			}
			
			
			
			
			
			
		}
		
	
		
		
		
		
		
	}}