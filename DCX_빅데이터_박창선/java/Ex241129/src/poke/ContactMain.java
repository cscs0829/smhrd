package poke;

import java.util.ArrayList;

public class ContactMain {
	public static void main(String[] args) {
	
		// 연락처들을 담을 수 있는 ArrayList를 만들자!!
		// ArrayList<데이터타입> 변수명 = new ArrayList<데이터타입>();
		ArrayList<Contact> contacts = new ArrayList<Contact>();
		
		Contact con1 = new Contact("이주희", 20, "010-3228-5850");
        contacts.add(con1);
        contacts.add(new Contact("박명훈", 21, "010-0000-0000"));
        contacts.add(new Contact("문채은", 22, "010-1111-0000"));
		
		// 1번 인덱스에 있는 전화번호 가져오기
		System.out.println(contacts.get(1).getTel());
	
		// 1. 이주희(20세) : 010-3228-5850
	
		for (int i = 0; i < contacts.size(); i++) {
            String name = contacts.get(i).getName();
            int age = contacts.get(i).getAge();
            String tel = contacts.get(i).getTel();
                   
            System.out.printf("%d. %s(%d세) : %s\n", (i+1), name, age, tel);
        }
}
}
