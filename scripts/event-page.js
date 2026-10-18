const INTERACTABLE_ELEMENTS = document.getElementsByClassName('interactable');
const pointerUpEventName = window.PointerEvent ? 'pointerup' : 'mouseup'; //Legacy feature check. Probably won't be needed but it's good to have lmao.

function prepareInteractables() {
    for(let e = 0; e < INTERACTABLE_ELEMENTS.length; ++e) {
        const element = INTERACTABLE_ELEMENTS[e];
        if(!element) continue; //Can't really happen but just in-case.

        //Add required elements.
        //element.addEventListener("click", (mEvent) => goToPageProxy(element, mEvent));
        //element.addEventListener("auxclick", (mEvent) => goToPageProxy(element, mEvent));
        element.setAttribute('draggable', false);
        element.addEventListener(pointerUpEventName, (mEvent) => goToPageProxy(element, mEvent));
    }
}

function goToPageProxy(element, mEvent) { //Handles mouse presses.
    //0 = LMB
    //1 = MMB
    //2 = RMB

    if(mEvent.button > 1) return; //Don't bother with other mouse buttons.
    //console.log(document.elementFromPoint(mEvent.clientX, mEvent.clientY));
    switch(mEvent.button) {
        case 0: //LMB
            goToPage(element, false);
            break;
        case 1: //MMB
            goToPage(element, true);
            break;
    }
}

function onEventPageLoad() {
    prepareInteractables();
}

//Add DOMContentLoaded callback only if neccessary.
if(document.readyState === "loading")
    window.addEventListener('DOMContentLoaded', onEventPageLoad);
else
    onEventPageLoad();