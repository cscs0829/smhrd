package Jdb;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Scanner;

public class Ex03Delect {

	public static void main(String[] args) {
      
      Connection conn = null;
      PreparedStatement psmt = null;
      Scanner sc = new Scanner(System.in);
      
      System.out.print("탈퇴할 ID : ");
      String user_id = sc.next();
      
      System.out.print("탈퇴할 PW : ");
      String user_pw = sc.next();
      
      
      try {
         
         // 1. 동적 로딩
         Class.forName("oracle.jdbc.OracleDriver");
         
         // url, id, pw
         String url = "jdbc:oracle:thin:@localhost:1521:xe";
         String id = "hr";
         String pw = "12345";
         
         conn = DriverManager.getConnection(url, id, pw);
         
         // 2. sql 쿼리문 작성 및 전송
         String sql = "DELETE FROM MEMBER WHERE ID =? AND PW =?";
         
         psmt = conn.prepareStatement(sql);
         
         psmt.setString(1, user_id);
         psmt.setString(2, user_pw);
         
         // CRUD : Create(생성), Read(조회), Update(갱신), Delete(삭제)
         // executeUpdate() : insert, update, delete
         // int값 반환 -> 실행에 성공했을 때 변환된 row의 수 
         // executeQuery() : select
         // ResultSet 반환 -> 커서객체
         
         int cnt = psmt.executeUpdate();
         
         if(cnt > 0) {
            System.out.println("회원 탈퇴 완료!");
         }else {
            System.out.println("회원 탈퇴 실패..");
         }
         
      } catch (ClassNotFoundException e) {
         // TODO Auto-generated catch block
         e.printStackTrace();
      } catch (SQLException e) {
         // TODO Auto-generated catch block
         e.printStackTrace();
      }finally {
         
         try {
            psmt.close();
            conn.close();
         } catch (SQLException e) {
            e.printStackTrace();
         }
         
      }
      
      
      

   }

}
