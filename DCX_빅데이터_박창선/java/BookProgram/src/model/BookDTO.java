package model;

public class BookDTO {

	private int book_num;
	private String book_name;
	private String book_writer;
	private String book_price;
	private String is_rented;
	
	
	public BookDTO(int book_num, String book_name, String book_writer, String book_price, String is_rented) {
		super();
		this.book_num = book_num;
		this.book_name = book_name;
		this.book_writer = book_writer;
		this.book_price = book_price;
		this.is_rented = is_rented;
	}


	public int getBook_num() {
		return book_num;
	}


	public String getBook_name() {
		return book_name;
	}


	public String getBook_writer() {
		return book_writer;
	}


	public String getBook_price() {
		return book_price;
	}


	public String getIs_rented() {
		return is_rented;
	}
	
	
	
	
	
	
}
