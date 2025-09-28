package 닌텐도게임;

public class GameMain {
    public static void main(String[] args) {
        Mario m1 = new Mario();
        insert(m1);

        Dongmul d1 = new Dongmul();
        insert(d1);

        Zelda z1 = new Zelda();
        insert(z1);

        Krby k1 = new Krby();
        insert(k1);
    }

    public static void insert(GameChip chip) {
        chip.start();
    }
}
