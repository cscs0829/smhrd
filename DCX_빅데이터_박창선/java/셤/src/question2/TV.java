package question2;

public class TV {

    int channel; 
    String color;
    
    void channelUp() {
		++channel;
		
	}
    
    void channelDown() {
		--channel;
	} 
    void print() {
    	System.out.println("Tv의 현재 채널은 : " + channel + "이고, " + "TV의 색깔은 "+  color +" 입니다.");
    }
    
}
