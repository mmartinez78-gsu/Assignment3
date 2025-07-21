const guessCountDisplay = document.getElementById("guesses-left");
const messageDisplay = document.getElementById("message");
const guessButton = document.getElementById("guess-btn");
const guessInput = document.getElementById("guess-input");

var gameState = "Start";
var guessCount = 10;
var goalNumber = Math.ceil(Math.random() * 100);

guessButton.addEventListener("click", () => {
    switch(gameState){
        case "Start":
            if(guessInput.value == ""){
                messageDisplay.innerText = "Please enter a number";
                messageDisplay.style.color = "red";
            } else if (guessInput.value == goalNumber) {
                    messageDisplay.innerText = "You got it!";
                    messageDisplay.style.color = "green";
                    gameState = "End";
                    guessButton.innerText = "Restart";
            } else {
                guessCount--;
                guessCountDisplay.innerText = String(guessCount);
                if(guessCount < 1){
                    messageDisplay.innerText = `Sorry, you lose... The number was ${goalNumber}!`;
                    messageDisplay.style.color = "red";
                    gameState = "End";
                    guessButton.innerText = "Restart";
                } else {
                    messageDisplay.innerText = "";
                    guessInput.innerText = "";
                    guessInput.value = "";
                }
            }
            break;
        case "End":
            guessInput.innerText = "";
            guessInput.value = "";
            messageDisplay.innerText = "";
            guessCount = 10;
            guessCountDisplay.innerText = String(guessCount);
            goalNumber = Math.ceil(Math.random() * 100);
            gameState = "Start";
            guessButton.innerText = "Guess";
            break;
    }
});


const minValue = 1;
const maxValue = 100;

guessInput.addEventListener('input', function() {
    let value = this.value;
    value = value.replace(/[^0-9]/g, '');
    let intValue = parseInt(value, 10);

    if (isNaN(intValue)) {
        this.value = '';
        return;
    }

    if (intValue < minValue) {
        intValue = minValue;
    } else if (intValue > maxValue) {
        intValue = maxValue;
    }

    this.value = intValue;
});

guessInput.addEventListener('blur', function() {
    let value = this.value;
    let intValue = parseInt(value, 10);

    if (isNaN(intValue)) {
        this.value = minValue;
    } else if (intValue < minValue) {
        this.value = minValue;
    } else if (intValue > maxValue) {
        this.value = maxValue;
    }
});
