package model;

// DTO : Data Transfer Object
public class BookDTO {

	// 필드
	private int book_num;
	private String book_name;
	private String book_writer;
	private String book_price;
	
	
	public BookDTO(int book_num, String book_name, String book_writer, String book_price) {
		super();
		this.book_num = book_num;
		this.book_name = book_name;
		this.book_writer = book_writer;
		this.book_price = book_price;
	}


	public int getBook_num() {
		return book_num;
	}


	public void setBook_num(int book_num) {
		this.book_num = book_num;
	}


	public String getBook_name() {
		return book_name;
	}


	public void setBook_name(String book_name) {
		this.book_name = book_name;
	}


	public String getBook_writer() {
		return book_writer;
	}


	public void setBook_writer(String book_writer) {
		this.book_writer = book_writer;
	}


	public String getBook_price() {
		return book_price;
	}


	public void setBook_price(String book_price) {
		this.book_price = book_price;
	}


	
	// 메소드(getter/setter, 생성자메소드)
	
	
	
	
	
}
