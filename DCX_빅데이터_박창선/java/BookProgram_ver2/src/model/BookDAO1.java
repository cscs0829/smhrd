package model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


public class BookDAO1 {
	
	Connection conn = null;
	PreparedStatement psmt = null;
	ResultSet rs = null;
	
	public void bookList() {
		connect();
		
		try {
			
			String sql = "SELECT * FROM BOOK";
			psmt = conn.prepareStatement(sql);
			rs = psmt.executeQuery();
			
			while(rs.next()) {
				int book_num = rs.getInt(1);
				String book_name = rs.getString(2);
				String book_writer = rs.getString(3);
				String book_price = rs.getString(4);
				
				System.out.printf("%d\t%s\t%s\t%s\n", book_num, book_name, book_writer, book_price);
			}
			
			
		}catch (Exception e) {
			e.printStackTrace();
		}finally {
			close();
		}
	}
	
	public BookDTO1 borrowBook(String id, int book_num) {
		
		connect();
		BookDTO dto = null;
		try {
			
			String sql1 = "SELECT * FROM BOOK WHERE BOOK_NUM=?";
			psmt = conn.prepareStatement(sql1);
			psmt.setInt(1, book_num);
			rs = psmt.executeQuery();
			
			if(rs.next()) {
				String book_name = rs.getString(2);
				String book_writer = rs.getString(3);
				String book_price = rs.getString(4);
				
				dto = new BookDTO(book_num, book_name, book_writer, book_price);
//				System.out.println(dto.getBook_num() + dto.getBook_name() + dto.getBook_writer() + dto.getBook_price());
				
				String sql3 = "UPDATE MEMBER SET BOOK_NAME=? WHERE ID=?";
				psmt = conn.prepareStatement(sql3);
				
				psmt.setString(1, book_name);
				psmt.setString(2, id);
				psmt.executeUpdate();
				
				String sql2 = "DELETE FROM BOOK WHERE BOOK_NUM=?";
				psmt = conn.prepareStatement(sql2);
				psmt.setInt(1, book_num);
				psmt.executeUpdate();
			}
			
			
		}catch (Exception e) {
			e.printStackTrace();
		}finally {
			close();
		}
		
		return dto;
	}
	
	public void returnBook(BookDTO dto) {

		connect();
		
		try {
			String sql = "INSERT INTO BOOK VALUES(?, ?, ?, ?)";
			psmt = conn.prepareStatement(sql);
			
			psmt.setInt(1, dto.getBook_num());
			psmt.setString(2, dto.getBook_name());
			psmt.setString(3, dto.getBook_writer());
			psmt.setString(4, dto.getBook_price());
			
			psmt.executeUpdate();
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			close();
		}
		
	}
	
	public void memberBook(String id) {

		connect();
		
		try {

			String sql = "SELECT * FROM MEMBER WHERE ID=?";
			psmt = conn.prepareStatement(sql);
			psmt.setString(1, id);
			rs = psmt.executeQuery();
			
			if(rs.next()) {
				String name = rs.getString(3);
				String book_name = rs.getString(5);
				System.out.println(name + "님이 빌린 책 : " + book_name);
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			close();
		}
		
		
	}
	
	
	
	
	
	private void close() {
		try {
			if (rs != null) {
				rs.close();
			}
			psmt.close();
			conn.close();
		} catch (Exception e2) {
			// TODO: handle exception
		}
	}

	private void connect() {
		try {
			Class.forName("oracle.jdbc.OracleDriver");

			String url = "jdbc:oracle:thin:@localhost:1521:xe";
			String db_id = "hr";
			String db_pw = "12345";

			conn = DriverManager.getConnection(url, db_id, db_pw);

		} catch (ClassNotFoundException e) {
			System.out.println("클래스 못찾음..");
		} catch (SQLException e) {
			System.out.println("DB연결 실패..");
		}
	}

	

	









	

	
	

	

}

