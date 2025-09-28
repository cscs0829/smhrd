package Jdb;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Scanner;

public class Ex05Select {

	public static void main(String[] args) {
		Connection conn = null;
		PreparedStatement psmt = null;
		ResultSet rs = null;
		Scanner sc = new Scanner(System.in);

		System.out.print("로그인할 ID : ");
		String user_id = sc.next();
		System.out.print("로그인할 PW : ");
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
			String sql = "SELECT * FROM MEMBER";

			psmt = conn.prepareStatement(sql);
			

			// CRUD : Create(생성), Read(조회), Update(갱신), Delete(삭제)
			// executeUpdate() : insert, update, delete
			// int값 반환 -> 실행에 성공했을 때 변환된 row의 수
			// executeQuery() : select
			// ResultSet 반환 -> 커서객체

			rs = psmt.executeQuery(); // ResultSet rs;
			// rs.next(); //커서객체(ResultSet)을 한칸 내리는 역할

			while(rs.next()) {
				
			
				String login_id = rs.getString(1);
				String login_pw = rs.getString(2);
				String login_name = rs.getString("NAME");
				int login_age = rs.getInt("AGE");
				
				System.out.printf("%s\t%s\t%s\t%d\n",login_id, login_pw,login_name, login_age);
			}
				// TEST1 TEST1 테스트1 0
				// System.out.printf("%s\t%s\t%s\t%d", login_id, login_pw, login_name,
				// login_age);
				
			

			// System.out.println(rs.next());

		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {

			try {
				psmt.close();
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}

		}

	}

}
