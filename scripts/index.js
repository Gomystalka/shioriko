const MAIN_CONTAINER_ELEMENT = document.getElementById('flyer-container');

/*
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    MAIN_CONTAINER_ELEMENT.style.display = 'block';
    MAIN_CONTAINER_ELEMENT.classList.remove('slide-left-anim');
  }
});
*/
window.onpageshow = function(event) {
    if(event.persisted) {
        MAIN_CONTAINER_ELEMENT.style.display = 'block';
        MAIN_CONTAINER_ELEMENT.classList.remove('slide-left-anim');
    }
};

const MAIN_SCRIPT_RESOURCE_IDENTITY = "Main";
const ResourceType = {
    image: [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.bmp',
        '.svg'
    ],
    script: [
        '.js',
        '.json'
    ],
    text: [
        '.txt'
    ],
    directory: []
}
const ElementStatusClass = {
    close_call: "close-call-text",
    loss: "loss-text",
    win: "win-text",
    perfect_win: "perfect-win-text",
    one_try_left: "one-try-left-text",
    fail: "fail",
    revealed: "revealed",
    suspended: "suspended"
}
const kXProfileURL = "https://x.com/";

//Used to fetch a JSON resource from the server.
async function fetchJSONResource(resourcePath) {
    let response = await fetch(resourcePath);
    if(response.ok)
        return await response.json();
    return undefined;
}
window.fetchJSONResource = fetchJSONResource;
window.sanitizeHTML = function(s) {
    if(s === undefined) return s; 
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
}
window.formatString = function(str, ...opt) {
    return str.replace(/{(\d+)}/g, function(m, i) {
        return opt[i] !== undefined ? opt[i] : m;
    });
}
const BACKGROUND_ELEMENT = document.getElementById('background-primary');
const SECONDARY_BACKGROUND_ELEMENT = document.getElementById('background-hidden');

const BACKGROUND_COUNT = 49;
const BACKGROUND_PATH = "/images/Backgrounds/";
const TIME_TILL_REDIRECT_MILLIS = 200;

let currentBackgroundElement = BACKGROUND_ELEMENT; //Start with BACKGROUND_ELEMENT being the main background element.
let currentHiddenBackgroundElement = SECONDARY_BACKGROUND_ELEMENT; //Start with SECONDARY_BACKGROUND_ELEMENT being the hidden background element.
let currentBackgroundIndex = 0;

let options = {
    isBackgroundAnimationRunning: true
};

function setMainBackgroundByIndex(index) {
    currentBackgroundElement.style.backgroundImage = `url('${BACKGROUND_PATH}${index}.jpg')`;
}

function setHiddenBackgroundByIndex(index) {
    currentHiddenBackgroundElement.style.backgroundImage = `url('${BACKGROUND_PATH}${index}.jpg')`;
}

function goToPage(element, openInNewTab) { //Used by the banner and buttons to avoid using an 'a' tag.
    let src = element.getAttribute('data-target');
    let isXHandle = element.hasAttribute('data-x');
    if(isXHandle)
        src = kXProfileURL + src;

    const isHome = src === "#";

    if(!openInNewTab) {
        if(isHome) { //Home
            if(MAIN_CONTAINER_ELEMENT) { //This doesn't exist on all pages.
                MAIN_CONTAINER_ELEMENT.style.display = 'block'; //The original display mode of the button list is flex.
                MAIN_CONTAINER_ELEMENT.classList.remove('slide-left-anim');
            }
        }
        else {
            if(MAIN_CONTAINER_ELEMENT)
                MAIN_CONTAINER_ELEMENT.classList.add('slide-left-anim');
        }
    }

    setTimeout(() => {
        if(!isHome && !isExternalLink(src)) //Append query params if any, but only if the link is not external.
            src += window.location.search || "";
        if(!openInNewTab)
            window.location.href = src;
        else
            window.open(src, '_blank').focus(); //Open in new tab.
    }, openInNewTab ? 0 : TIME_TILL_REDIRECT_MILLIS);
}

function removeAllDataDebug() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.alert("All data has been removed. Page will now refresh...");
    window.location.reload();
}

function isExternalLink(src) {
    if(src.startsWith("//")) return true; //Handle Protocol-relative url.
    try {
        const url = new URL(src, window.location.origin);
        return url.hostname !== window.location.hostname && !url.hostname.endsWith(window.location.hostname); //Handle sub-domains.
    } catch(e) {
        return false;
    }
}

async function toggleSettings(context) {
    let navbar = document.getElementById('nav-bar');
    navbar.classList.toggle('nav-open-anim');

    const result = await fetch('/api/message', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Response raw: ${result}`);
    let format = await result.json();
    format.result.data.characters.items.forEach(c => console.log(c.name));
}

function switchAndLoadRandomBackgrounds() {
    const lastPrimaryBackground = currentBackgroundElement;
    currentBackgroundElement = currentHiddenBackgroundElement;
    currentHiddenBackgroundElement = lastPrimaryBackground;

    //currentBackgroundElement.style.transform = `scale(1, 1)`; //Reset scales and visibility.
    currentBackgroundElement.style.display = 'block';
    currentHiddenBackgroundElement.style.transform = `scale(1, 1)`;
    currentHiddenBackgroundElement.style.display = 'none';

    //Generate a unique index to avoid backgrounds from repeating. This functions fails if there is only one background.

    let newIndex = getRandomUniqueIndex(currentBackgroundIndex, BACKGROUND_COUNT);
    setHiddenBackgroundByIndex(newIndex);
    currentBackgroundIndex = newIndex;
}

function getRandomUniqueIndex(indexToAvoid, maxSize) {
    if(maxSize <= 1) return 0; //Avoid infinite recursion if size is less than or equal to 1.
    let newIndex = Math.floor(Math.random() * maxSize);

    if(newIndex == indexToAvoid)
        return getRandomUniqueIndex(indexToAvoid, maxSize);

    return newIndex;
}

const BACKGROUND_ANIMATION_DURATION_MILLIS = 15000;
const BACKGROUND_SCALE_TARGET = 1.5;
const BACKGROUND_FADE_OUT_START_PROGRESS_TARGET = 0.75;
const BACKGROUND_OPACITY_TARGET = 0.5;

let animationStartTime;
let lastTimestamp;
let lastElapsedTimeMillis = 0;

function animateBackground(timestamp) {
    if(!animationStartTime)
        animationStartTime = timestamp;
    if(!lastTimestamp)
        lastTimestamp = timestamp;

    let elapsedTime = (timestamp - animationStartTime) + lastElapsedTimeMillis; //lastElapsedTimeMillis is an offset of how long the fade-in/fade-out animation took in milliseconds.
    let normalizedTime = (elapsedTime % BACKGROUND_ANIMATION_DURATION_MILLIS) / BACKGROUND_ANIMATION_DURATION_MILLIS; //Calculate the current animation progress.

    if(elapsedTime >= BACKGROUND_ANIMATION_DURATION_MILLIS)
        normalizedTime = 1.0; //Make sure 1.0 is hit.

    //Calculate the scale based on the current time.
    let scale = 1 + (normalizedTime * (BACKGROUND_SCALE_TARGET - 1)); //Make sure scale starts at 1.
    currentBackgroundElement.style.transform = `scale(${scale},${scale})`; //Animate background scale.

    if(normalizedTime >= BACKGROUND_FADE_OUT_START_PROGRESS_TARGET) { //Start fade out/fade in when time target is reached.
        currentHiddenBackgroundElement.style.display = 'block'; //Show the hidden background.

        let alpha = (normalizedTime - BACKGROUND_FADE_OUT_START_PROGRESS_TARGET) / (1 - BACKGROUND_FADE_OUT_START_PROGRESS_TARGET); //For fade in.
        let reverseAlpha = 1 - alpha; //For fade out.

        //console.log(`A: ${alpha} | NormTime: ${normalizedTime} | Target: ${BACKGROUND_FADE_OUT_START_PROGRESS_TARGET}`);

        currentBackgroundElement.style.opacity = `${BACKGROUND_OPACITY_TARGET * reverseAlpha}`; //Fade out the current background element by [reverseAlpha] => Start 1 end 0
        currentHiddenBackgroundElement.style.opacity = `${BACKGROUND_OPACITY_TARGET * alpha}`; //Fade in the current hidden background elemebt by [alpha]  => Start 0 end 1
        
         //Only start hidden background scale when the target is reached at the right position then pick up from the correct point in time when the animation loops smoothly.
        let newScale = 1 + ((normalizedTime - BACKGROUND_FADE_OUT_START_PROGRESS_TARGET) * (BACKGROUND_SCALE_TARGET - 1));
        currentHiddenBackgroundElement.style.transform = `scale(${newScale},${newScale})`;

        if(normalizedTime >= 1.0) { //When fade out/in is finished.
            switchAndLoadRandomBackgrounds(); //Param: startAnimation : bool
            lastElapsedTimeMillis = (1 - BACKGROUND_FADE_OUT_START_PROGRESS_TARGET) * BACKGROUND_ANIMATION_DURATION_MILLIS; //Calculate by how much to offset the current time.
            animationStartTime = timestamp;
        }
    }

    //Only run the animation if it is enabled.
    if(options.isBackgroundAnimationRunning)
        requestAnimationFrame(animateBackground);
}

function onTransitionEnd(event) {
    //Handle proper hiding of main-menu buttons.
    if(event.propertyName === "visibility" && event.target === MAIN_CONTAINER_ELEMENT) {
        //When the transition ends, this means the buttons have disappeared from the screen. If this happens, set display to none.
        MAIN_CONTAINER_ELEMENT.style.display = 'none';
    }
}

async function initializeApp() {
    addEventListener("transitionend", onTransitionEnd);
    currentBackgroundIndex = getRandomUniqueIndex(-1, BACKGROUND_COUNT); //Generate a random background.
    let hiddenBackgroundIndex = getRandomUniqueIndex(currentBackgroundIndex, BACKGROUND_COUNT);
    setMainBackgroundByIndex(currentBackgroundIndex);
    setHiddenBackgroundByIndex(hiddenBackgroundIndex);
    currentBackgroundIndex = hiddenBackgroundIndex; //Set the current index to the hidden background index to ensure proper switching on the first switch.

    requestAnimationFrame(animateBackground); //Start animation.
}
initializeApp();