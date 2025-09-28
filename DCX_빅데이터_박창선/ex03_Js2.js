

        let num = 0;
        const increase = () => {
            num++;
            document.getElementById('num').innerText = `Like! ♥ ${num}`;
        }
        const decrease = () => {
            if (num > 0) {
            num--;
            document.getElementById('num').innerText = `Like! ♥ ${num}`;}
        }
        const reset = () => {
            num = 0;
            document.getElementById('num').innerText = `Like! ♥ ${num}`;
        }