package model;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

// DAO : Data Access object
public class MeberDAO {

	
	Connection conn = null;
	PreparedStatement psmt = null;
	ResultSet rs = null;
	
	public int login(MemberDTO dto) { // dt -> id, pw
		
		connect();
		
		
		int result = 0;
		
		try {
			
			String sql = "SELECT * FROM MEMBER WHERE ID=? AND PW=?";
			psmt = conn.prepareStatement(sql);
			
			psmt.setString(1, dto.getId());
			psmt.setString(2, dto.getPw());
			
			rs = psmt.executeQuery();
			
			if(rs.next()) {
				//로그인 성공
				result = 1;
			}else {
				//로그인 실패
				result = 0;
			}
			
		} catch (SQLException e) {
			System.out.println("SQL 쿼리 검사하기!");
		}finally {
			close();
			
		}
		
		return result; // true or false, 1 or 0
		
	}

	//회원가입 기능
	public int join(MemberDTO dto) {
		
		connect();
		
		int cnt = 0;
	
		try {
			String sql = "INSERT INTO MEMBER VALUES(?, ?, ?, ?)"; 
			psmt = conn.prepareStatement(sql);
			
			
			psmt.setString(1, dto.getId());
			psmt.setString(2, dto.getPw());
			psmt.setString(3, dto.getName());
			psmt.setInt(4, dto.getAge());
			
			cnt = psmt.executeUpdate();
			
	
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
	
	return cnt;

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

	
	// 로그인 가능

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
	
	// 정보수정 기능
	 // 회원정보 수정 기능
    public int update(MemberDTO dto) {
        
    	connect();

        int cnt = 0;

        try {
            String sql = "UPDATE MEMBER SET NAME = ?, AGE = ? WHERE ID = ? AND PW = ?";
            psmt = conn.prepareStatement(sql);

            psmt.setString(1, dto.getName());
            psmt.setInt(2, dto.getAge());
            psmt.setString(3, dto.getId());
            psmt.setString(4, dto.getPw());

            cnt = psmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close();
        }

        return cnt;
    }

    

	// 전체조회 기능
	public void memberList() {
		
		connect();
		
		try {
			
			String sql = "SELECT * FROM MEMBER";
			psmt = conn.prepareStatement(sql);
			
			rs = psmt.executeQuery();
			
			while(rs.next()) {
				
				String id = rs.getString(1);
				String pw = rs.getString(2);
				String name = rs.getString("name");
				int age = rs.getInt(4);
				
				System.out.printf("%s\t%s\t%s\t%d\n", id, pw ,name, age );
				
				
			}
		
		
		}catch (Exception e) {
			// TODO: handle exception
		}finally {
			close();
		}
	}
     
	// 회원탈퇴 기능
	
public int delete(MemberDTO dto) {
        
    	connect();

        int cnt = 0;

        try {
            String sql = "DELETE MEMBER SET PW = ? WHERE PW = ?";
            psmt = conn.prepareStatement(sql);

            psmt.setString(1, dto.getName());
            psmt.setInt(2, dto.getAge());
            psmt.setString(3, dto.getId());
            psmt.setString(4, dto.getPw());

            cnt = psmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close();
        }

        return cnt;
    }
	
	
	
	
}
