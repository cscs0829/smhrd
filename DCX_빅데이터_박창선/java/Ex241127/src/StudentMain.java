
public class StudentMain {

	public static void main(String[] args) {
		
		Student p1 = new Student();
        Student p2 = new Student();
        
        
        p1.name = "이주희";
        p1.num = 20201025;
        p1.age = 20;
        p1.java = 60;
        p1.web = 55;
        p1.and = 45;

        
        
        System.out.println(p1.name+"님 안녕하세요.");
        System.out.print("["+p1.num+", ");
        System.out.println(p1.age+"살]");
        System.out.println(p1.name+"님의 java점수는 " +p1.java+"점 입니다");
        System.out.println(p1.name+"님의 web점수는 " +p1.web+"점 입니다");
        System.out.println(p1.name+"님의 android점수는 " +p1.and+"점 입니다");
        
        System.out.println("==========================");
        p2.name = "홍길동";
        p2.num = 199900216;
        p2.age = 19;
        p2.java = 90;
        p2.web = 60;
        p2.and = 100;

        
        
        System.out.println(p2.name);
        System.out.println(p2.num);
        System.out.println(p2.age);
        System.out.println(p2.java);
        System.out.println(p2.web);
        System.out.println(p2.and);
        
        System.out.println("=====================================");
	}

}
