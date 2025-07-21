if(!localStorage.getItem("top5")){
    localStorage.setItem("top5", JSON.stringify(Array(5).fill({
        name: "---",
        score: 0
    })));
}
loadLeaderboard();

const overlay = document.getElementById("overlay");
const setupPage = document.getElementById("Setup");
const gamePage = document.getElementById("Game");
const startBtn = document.getElementById("start-game");
const difficultySetting = document.getElementById("difficulty");
const pairsSetting = document.getElementById("pairs");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const scoreContainer = document.getElementById("score-container");
const cards = Array.from({length: 4}, () => Array(6));

const stopTimer = { value: false };
var stopPointLoss = false;
var score = 0;
var allowTileClick = false;
var selected = undefined;

for(y = 0; y < cards.length; y++){
    for(x = 0; x < cards[y].length; x++){
        cards[y][x] = document.getElementById(`card${y+1}-${x+1}`);
        cards[y][x].addEventListener("click", function () {
            if(!allowTileClick || JSON.parse(this.dataset.finished) || this == selected) return;
            if(selected){
                let selectPtr = selected;
                this.classList.add("flipped");
                this.dataset.finished = true;
                selected.dataset.finished = true;
                if(this.dataset.index == selected.dataset.index){
                    updateScore(10);
                    endGame();
                } else {
                    updateScore(-5);
                    setTimeout(() => {
                        this.classList.remove("flipped");
                        selectPtr.classList.remove("flipped");
                        this.dataset.finished = false;
                        selectPtr.dataset.finished = false;
                    }, 1000);
                }
                selected = undefined;
            } else {
                this.classList.add("flipped");
                selected = this;
            }
        });
    }
}

function transitionGame(direction, next){
    var start = undefined;
    var dest = undefined;

    switch(direction){
        case "toSetup":
            start = gamePage;
            dest = setupPage;
            break;
        case "toGame":
            start = setupPage;
            dest = gamePage;
            break;
    }

    start.style.opacity = '0';

    start.addEventListener('transitionend', function handler() {
        start.removeEventListener('transitionend', handler);
        start.style.display = 'none';

        dest.style.display = 'flex';
        void dest.offsetWidth;
        dest.style.opacity = '1';
        
        const callback = next();
        
        dest.addEventListener('transitionend', function handled() {
            dest.removeEventListener('transitionend', handled);
            if(callback) callback();
        });
    });
}

startBtn.addEventListener("click", () => {
    mm = Math.floor(difficultySetting.value / 60);
    ss = difficultySetting.value - (mm * 60);
    timerDisplay.innerText = String(mm).padStart(2, "0") + ':' + String(ss).padStart(2, "0");

    score = 0;
    scoreDisplay.innerText = "000";

    transitionGame("toGame", () => {return setupMatch(parseInt(difficultySetting.value), parseInt(pairsSetting.value))});
});

function setupMatch(difficulty, pairs){
    Array.from(document.getElementsByClassName("twelve-tile")).forEach(tile => tile.style.display = "none");
    Array.from(document.getElementsByClassName("ten-tile")).forEach(tile => tile.style.display = "none");
    var cols = 4;
    switch(pairs){
        case 12:
            Array.from(document.getElementsByClassName("twelve-tile")).forEach(tile => tile.style.display = "block");
            cols++;
        case 10:
            Array.from(document.getElementsByClassName("ten-tile")).forEach(tile => tile.style.display = "block");
            cols++;
    }

    const flat = Array.from({ length: pairs }, (_, i) => [i + 1, i + 1]).flat();
    for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
    }

    const gameArray = Array.from({ length: 4 }, (_, r) => flat.slice(r * cols, (r + 1) * cols));

    let ind = 0
    for(y = 0; y < 4; y++){
        for(x = 0; x < cols; x++){
            ind++;
            cards[y][x].dataset.index = gameArray[y][x];
            cards[y][x].dataset.finished = false;
            cards[y][x].querySelector(".card-front").innerText = String(ind);
            cards[y][x].querySelector(".card-back").innerHTML = `<img src="${gameArray[y][x]}.jpg">`;
        }
    }

    return (function callback() {begin(difficulty, cols)});
}

function begin(difficulty, cols){
    for(y = 0; y < 4; y++){
        for(x = 0; x < cols; x++){
            cards[y][x].classList.add("flipped");
        }
    }

    runTimer(difficulty, { value: false }).then(
        () => {
            for(y = 0; y < 4; y++){
                for(x = 0; x < cols; x++){
                    cards[y][x].classList.remove("flipped");
                }
            }
            startGame(cols);
        }, () => {}
    );
}

function startGame(cols){
    allowTileClick = true;
    stopTimer.value = false;
    stopPointLoss = false;

    runTimer((4 * cols * 15) / 2, stopTimer).then(
        () => {
            var timerInterval = setInterval(() => {
                if(stopPointLoss){
                    clearInterval(timerInterval);
                } else {
                    updateScore(-1);
                }
            }, 1000);
        }, () => {}
    );
}

function endGame(){
    for(y = 0; y < cards.length; y++){
        for(x = 0; x < cards[y].length; x++){
            if(cards[y][x].hasAttribute('data-finished')){
                if(!JSON.parse(cards[y][x].dataset.finished)) return;
            }
        }
    }

    for(y = 0; y < cards.length; y++){
        for(x = 0; x < cards[y].length; x++){
            cards[y][x].classList.remove("flipped");
            wipeElement(cards[y][x].dataset);
        }
    }

    allowTileClick = false;
    stopPointLoss = true;
    stopTimer.value = true;

    const overlayElements = overlay.firstElementChild;

    overlayElements.querySelector("#finalScoreMessage").innerText = String(score);

    const top5 = JSON.parse(localStorage.getItem("top5"));
    if(score > top5[4].score){
        overlayElements.querySelector("#prizeMessage").style.display = "block";
        overlayElements.querySelector("#playerName").style.display = "block";

        place = 1;
        for(i = 0; i < top5.length; i++){
            if(top5[i].score <= score){
                break;
            }
            place++;
        }

        ordinal = "";
        switch(place){
            case 1:
                ordinal = "1st";
                break;
            case 2:
                ordinal = "2nd";
                break;
            case 3:
                ordinal = "3rd";
                break;
            case 4:
                ordinal = "4th";
                break;
            case 5:
                ordinal = "5th";
                break;
        }

        overlayElements.querySelector("#prizeMessage").innerText = `You've made ${ordinal} place! Enter your name:`;

        overlayElements.querySelector("#continue-btn").addEventListener("click", function submitLeaderScore() {
            if(!overlayElements.querySelector("#playerName").value.trim()) return;

            top5.push({name: overlayElements.querySelector("#playerName").value.trim(), score: score});
            top5.sort((a, b) => b.score - a.score);
            top5.pop();
            localStorage.setItem("top5", JSON.stringify(top5));

            overlayElements.querySelector("#prizeMessage").style.display = "none";
            overlayElements.querySelector("#playerName").style.display = "none";

            overlay.style.display = "none";
            gamePage.classList.remove("blur");
            setupPage.classList.remove("blur");

            transitionGame("toSetup", loadLeaderboard);

            overlayElements.querySelector("#continue-btn").removeEventListener("click", submitLeaderScore);
        });
    } else {
        overlayElements.querySelector("#continue-btn").addEventListener("click", function backToMenu() {
            overlay.style.display = "none";
            gamePage.classList.remove("blur");
            setupPage.classList.remove("blur");

            transitionGame("toSetup", loadLeaderboard);

            overlayElements.querySelector("#continue-btn").removeEventListener("click", backToMenu);
        });
    }

    overlay.style.display = "flex";
    gamePage.classList.add("blur");
    setupPage.classList.add("blur");
}

function wipeElement(dataset){
    for (const key in dataset) {
        if (dataset.hasOwnProperty(key)) {
            delete dataset[key];
        }
    }
}

function runTimer(time, cancelPtr){
    return new Promise((resolve, reject) => {
        var seconds = time;
        var cancel = cancelPtr;

        var timerInterval = setInterval(() => {
            if(cancel.value){
                clearInterval(timerInterval);
                reject();
            } else {
                seconds--;

                mm = Math.floor(seconds / 60);
                ss = seconds - (mm * 60);

                timerDisplay.innerText = String(mm).padStart(2, "0") + ':' + String(ss).padStart(2, "0");
                if(seconds < 1){
                    clearInterval(timerInterval);
                    resolve();
                }
            }
        }, 1000);
    });
}

function updateScore(amount){
    const popup = document.createElement('span');
    popup.textContent = String(amount);

    if(amount < 0){
        popup.className = "decrement-popup";
        popup.style.color = "red";
    } else {
        popup.className = "increment-popup";
        popup.style.color = "green";
    }

    popup.addEventListener('animationend', () => {
        popup.remove();
    });

    scoreContainer.appendChild(popup);

    score += amount;
    if(score < 0) score = 0;
    scoreDisplay.innerText = String(score).padStart(3, "0");
}

function loadLeaderboard(){
    const leaderboard = document.getElementById("scores-list");
    const top5 = JSON.parse(localStorage.getItem("top5"));
    for(i = 0; i < top5.length; i++){
        leaderboard.children[i].innerHTML = `<span>${top5[i].name}</span><span>${top5[i].score} Points</span>`;
    }
}
