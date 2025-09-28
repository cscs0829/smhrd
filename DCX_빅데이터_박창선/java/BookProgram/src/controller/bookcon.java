package controller;

import model.BookDAO;

public class bookcon {
    private BookDAO dao;

    // 생성자: DAO 초기화
    public bookcon() {
        dao = new BookDAO();
    }

    // 책 목록 보기
    public void showBookList() {
        dao.bookList();
    }

    // 책 대여
    public boolean rentBook(int book_num) {
        return dao.rentBook(book_num);
    }

    // 책 반납
    public boolean returnBook(int book_num) {
        return dao.returnBook(book_num);
    }
}
