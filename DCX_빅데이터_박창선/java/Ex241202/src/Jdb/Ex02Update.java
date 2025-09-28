package Jdb;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Scanner;

public class Ex02Update {

	public static void main(String[] args) {
      
      Connection conn = null;
      PreparedStatement psmt = null;
      Scanner sc = new Scanner(System.in);
      
      System.out.print("ID : ");
      String user_id = sc.next();
      
      System.out.print("수정할 PW : ");
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
         String sql = "UPDATE MEMBER SET PW=? WHERE ID=?";
         
         psmt = conn.prepareStatement(sql);
         
         psmt.setString(1, user_pw);
         psmt.setString(2, user_id);
         
         // CRUD : Create(생성), Read(조회), Update(갱신), Delete(삭제)
         // executeUpdate() : insert, update, delete
         // int값 반환 -> 실행에 성공했을 때 변환된 row의 수 
         // executeQuery() : select
         // ResultSet 반환 -> 커서객체
         
         int cnt = psmt.executeUpdate();
         
         if(cnt > 0) {
            System.out.println("회원정보 수정 완료!");
         }else {
            System.out.println("회원정보 수정 실패..");
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
