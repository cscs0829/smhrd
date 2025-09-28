package model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class BookDAO {
		
		
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
				String is_rented = rs.getString(5);
				
				System.out.printf("%d\t%s\t%s\t%s\t%s\n", book_num, book_name ,book_writer, book_price, is_rented);
				
				
			}
		
		
		}catch (Exception e) {
			// TODO: handle exception
		}finally {
			close();
		}
}

	public boolean rentBook(int book_num) {
	    connect();
	    BookDTO dto = null;
	    
	    try {
	        // 1. 책 상태 확인
	        String sql = "SELECT is_rented FROM BOOK WHERE book_num = ?";
	        psmt = conn.prepareStatement(sql);
	        psmt.setInt(1, book_num);
	        rs = psmt.executeQuery();
	        
	        if (rs.next()) {
	            String rent = rs.getString(1);
	            if ("Y".equalsIgnoreCase(rent)) {
	                System.out.println("이미 대여 중인 책입니다.");
	                return false;
	            }
	        } else {
	            System.out.println("존재하지 않는 책 번호입니다.");
	            return false;
	        }

	        // 2. 대여 처리
	        String sqlupdate = "UPDATE BOOK SET is_rented = 'Y' WHERE book_num = ?";
	        psmt = conn.prepareStatement(sqlupdate);
	        psmt.setInt(1, book_num);
	        int dayeo = psmt.executeUpdate();

	        if (dayeo > 0) {
	            System.out.println("책 대여 완료!");
	            return true;
	        } else {
	            System.out.println("책 대여 실패!");
	            return false;
	        }

	    } catch (SQLException e) {
	        e.printStackTrace();
	        return false;
	    } finally {
	        close();
	    }
	}

	public boolean returnBook(int book_num) {
	    connect();
	    try {
	        // 1. 책 상태 확인
	        String sql = "SELECT is_rented FROM BOOK WHERE book_num = ?";
	        psmt = conn.prepareStatement(sql);
	        psmt.setInt(1, book_num);
	        rs = psmt.executeQuery();
	        
	        if (rs.next()) {
	            String rent = rs.getString(1);
	            if ("N".equalsIgnoreCase(rent)) {
	                System.out.println("이미 반납된 책입니다.");
	                return false;
	            }
	        } else {
	            System.out.println("존재하지 않는 책 번호입니다.");
	            return false;
	        }

	        // 2. 반납 처리
	        String returnSql = "UPDATE BOOK SET is_rented = 'N' WHERE book_num = ?";
	        psmt = conn.prepareStatement(returnSql);
	        psmt.setInt(1, book_num);
	        int bannap = psmt.executeUpdate();

	        if (bannap > 0) {
	            System.out.println("책 반납 완료!");
	            return true;
	        } else {
	            System.out.println("책 반납 실패!");
	            return false;
	        }

	    } catch (SQLException e) {
	        e.printStackTrace();
	        return false;
	    } finally {
	        close();
	    }
	}

	
	
	private void close() {
		try {
			if(rs != null) {
				rs.close();				
			}
			psmt.close();
			conn.close();
			
		}catch (Exception e2) {
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
			
	}catch (ClassNotFoundException e) {
		System.out.println("클래스 못찾음..");
	} catch (SQLException e) {
		System.out.println("DB연결 실패..");
	}
	}
		
	}
	
     
     
