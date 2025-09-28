package controller;

import model.MeberDAO;
import model.MemberDTO;

//Controller
//사용자(View)가 요청한 값이 있으면 Controller에서 DAO로 연결
//View를 간단하게, 사용자가 딱 입력과 결과값만 볼 수 있음
public class MemberCon {

	MeberDAO dao = new MeberDAO();
	MemberDTO dto = null; 
	   
	public void loginCon(String id, String pw) {
	    dto = new MemberDTO(id, pw);
	     int result =dao.login(dto);
	         
	         if(result > 0) {
	            System.out.println("로그인 성공");
	         }else {
	            System.out.println("로그인 실패");
	            
	         }
	   }
	      public void joinCon(String id, String pw, String name, int age) {
	         dto = new MemberDTO(id, pw, name, age);
	         int cnt = dao.join(dto);
	         
	         if(cnt  == 1) {
	            System.out.println(name + "님 회원가입 성공!");
	         }else {
	            System.out.println(name + "님 회원가입 실패..");
	         }
	      }
	      
	      public void UpdateCon(String id, String pw) {
	         dto = new MemberDTO(id, pw);
	         int cnt = dao.update(dto);
	         
	         if(cnt > 0) {
	            System.out.println("회원정보 수정 성공");
	         }else {
	            System.out.println("회원정보 수정 실패");
	         }
	      }
	      
	      public void memberListCon() {
	         dao.memberList();
	      }
	      
	      public void DeleteCon(String id, String pw) {
	         dto = new MemberDTO(id, pw);
	         int cnt = dao.delete(dto);
	         
	         if(cnt > 0) {
	            System.out.println("회원탈퇴 성공");
	         }else {
	            System.out.println("회원탈퇴 실패");
	         }
	      }
	      
	      
	      
	      
	      
	      
	   
	   
	   
	   
	}
