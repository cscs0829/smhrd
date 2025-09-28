package Ex00_inheritence;

public class namumain {

	public static void main(String[] args) {
		
		
		namu namu = new namu();
		namu.name = "나무지기";
		namu.type = "풀";
		
		System.out.print(namu.name+ " ");
		System.out.print(namu.type+ " ");
		namu.attack();
		
		
		dol2 dol2 = new dol2();
		dol2.name = "나무돌이";
		dol2.type = "풀";
		
		System.out.print(dol2.name+ " ");
		System.out.print(dol2.type+ " ");
		dol2.attack();
		dol2.attack1();
		
		
		king king = new king();
		king.name = "나무킹";
		king.type = "풀";
		
		System.out.print(king.name+ " ");
		System.out.print(king.type+ " ");
		king.attack();
		king.attack1();
		king.attack3();
		
		
		
		
	}

}
