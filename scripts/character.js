const CHAR_ELEMENT = document.getElementById("character-frame");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function onLoad() {
    if(!CHAR_ELEMENT) return;
    const maxNum = parseInt(CHAR_ELEMENT.getAttribute("data-max-num"));
    const randomNum = getRandomInt(maxNum) + 1;

    const characterName = CHAR_ELEMENT.getAttribute("data-character");
    if(!characterName) return;
    CHAR_ELEMENT.src = `/images/Characters/${characterName}/${randomNum}.png`;
}

onLoad();