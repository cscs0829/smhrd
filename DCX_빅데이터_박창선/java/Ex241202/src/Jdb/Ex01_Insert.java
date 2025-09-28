package Jdb;

import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Scanner;
import java.sql.Connection;

public class Ex01_Insert {

    public static void main(String[] args) {

        // JDBC 연결 순서
        // 선행작업 : ojdbc.jar 파일 불러오기(프로젝트 라이브러리로 추가하기)
        // 라이브러리 추가하는 방법
        // 프로젝트 우클릭 -> Build Path -> Configure Build path

        // 객체를 전역변수처럼 위쪽에 선언 및 초기화
        Scanner sc = new Scanner(System.in);
        Connection conn = null; // null로 초기화
        PreparedStatement psmt = null; // null로 초기화

        // 데이터 입력받기 
        System.out.print("ID : ");
        String user_id = sc.next();

        System.out.print("pw : ");
        String user_pw = sc.next();

        System.out.print("NAME : ");
        String user_name = sc.next();

        System.out.print("AGE : ");
        int user_age = sc.nextInt();

        // 1. 연결 - JDBC 동적 로딩
        try {
            Class.forName("oracle.jdbc.OracleDriver");

            String url = "jdbc:oracle:thin:@127.0.0.1:1521:xe";
            String id = "hr";
            String pw = "12345";

            conn = DriverManager.getConnection(url, id, pw);

            if (conn != null) {
                System.out.println("DB 연결 성공!");
            } else {
                System.out.println("DB 연결 실패..");
            }

            // 2. SQL 쿼리 작성 및 전송
            String sql = "INSERT INTO MEMBER VALUES(?, ?, ?, ?)";
            psmt = conn.prepareStatement(sql);

            psmt.setString(1, user_id);
            psmt.setString(2, user_pw);
            psmt.setString(3, user_name);
            psmt.setInt(4, user_age);

            int cnt = psmt.executeUpdate();

            if (cnt == 1) {
                System.out.println("회원가입 성공!!");
            } else {
                System.out.println("회원가입 실패...");
            }

        } catch (ClassNotFoundException e) {
            System.out.println("OracleDriver 클래스를 못 찾았습니다");
        } catch (SQLException e) {
            System.out.println("SQL 관련 오류입니다~!");
        } finally {
            // 3. 통로 닫기
            try {
                if (psmt != null) {
                    psmt.close();
                }
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
