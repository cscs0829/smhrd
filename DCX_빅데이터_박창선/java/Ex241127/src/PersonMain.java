public class PersonMain {
    public static void main(String[] args) {
        
        Person p1 = new Person();
        Person p2 = new Person();
        Person p3 = new Person("강성환", 19, "남자");
         
        System.out.println(p3.name);
        System.out.println(p3.age);
        System.out.println(p3.gender);
        
        
        
        p1.name = "이주희";
        p1.age = 20;
        p1.gender = "여자";

        
        System.out.println(p1);
        System.out.println(p1.name);
        System.out.println(p1.age);
        System.out.println(p1.gender);

        
        
        p2.name = "아아아아";
        p2.age = 22;
        p2.gender = "남자";
        
        
        System.out.println(p2);
        System.out.println(p2.name); // null
        System.out.println(p2.age);  // 0
        
        p2.sleep();
        p2.talk();
        p2.coding();
		
		
		
		
		
		

	}

}
