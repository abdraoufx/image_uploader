"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
const REUPLOAD_DELAY_MS = 5000;
let isUserUploadedImage = false;
let uploadInProgress = false;
let waitingBeforeNextUpload = false;
const shownavigationigationButton = document.querySelector(".show-links-btn");
shownavigationigationButton === null || shownavigationigationButton === void 0 ? void 0 : shownavigationigationButton.addEventListener("click", () => closeAndOpennavigation(false));
const chooseFileButton = document.querySelector("#choose-file-btn");
chooseFileButton === null || chooseFileButton === void 0 ? void 0 : chooseFileButton.addEventListener("click", clickTheInput);
const uploadInput = document.querySelector("#img-input");
uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.addEventListener("change", () => submitTheInput(null));
const uploadForm = document.querySelector("#upload-form");
uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.addEventListener("click", clickTheInput);
uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.addEventListener("dragover", (e) => handleDragOver(e));
uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.addEventListener("dragleave", (e) => handleDragLeave(e));
uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.addEventListener("drop", (e) => handleDrop(e));
const errorBoxCloseButton = document.querySelector(".error-box .close-box");
errorBoxCloseButton === null || errorBoxCloseButton === void 0 ? void 0 : errorBoxCloseButton.addEventListener("click", () => changeErrorBoxVisibility("hide"));
document.addEventListener("DOMContentLoaded", renderStoredLinksInnavigationigation);
document.addEventListener("DOMContentLoaded", attachClickEventTonavigationigationElements);
const isStorageNoticeShowed = localStorage.getItem("storage-notice");
if (!isStorageNoticeShowed) {
    localStorage.setItem("storage-notice", `${true}`);
    changeErrorBoxVisibility("show", "This website is intended for practice purposes only, and if you encounter an unexpected error, it is likely due to storage limitations.");
}
function clickTheInput() {
    if (isUserUploadedImage) {
        restoreDragAndDropImageBox();
        return;
    }
    const uploadInput = document.querySelector("#img-input");
    changeErrorBoxVisibility("hide"); // if error box showed hide when clicked input
    uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.click();
}
function submitTheInput(imageArg) {
    if (!imageArg) {
        const uploadInput = document.querySelector("#img-input");
        handleImageUpload((uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.files) ? uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.files[0] : null);
        return;
    }
    handleImageUpload(imageArg);
}
function handleDragOver(e) {
    e.preventDefault(); // Prevent Open New Tab
    const target = e.currentTarget;
    const textSpan = target.querySelector(".tip");
    if (!target.classList.contains("dragging-img-over")) {
        target.classList.add("dragging-img-over");
        if (textSpan)
            textSpan.textContent = "Drop Image To Upload";
    }
}
function handleDragLeave(e) {
    e.preventDefault(); // Prevent Open New Tab
    const target = e.currentTarget;
    const textSpan = target.querySelector(".tip");
    if (target.classList.contains("dragging-img-over")) {
        target.classList.remove("dragging-img-over");
        if (textSpan)
            textSpan.textContent = "Drag & Drop Image Here";
    }
}
function handleDrop(e) {
    var _a;
    e.preventDefault(); // Prevent Open New Tab
    const image = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files[0];
    if (image) {
        changeErrorBoxVisibility("hide"); // If error box showed hided when drop
        submitTheInput(image); // Setting Input Files To The Dropped File
    }
    handleDragLeave(e);
}
function handleImageUpload(imageFile) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        changeErrorBoxVisibility("hide");
        if (!imageFile) {
            changeErrorBoxVisibility("show", "No image Uploaded"); // No Image Uploaded
            return;
        }
        if (isUserUploadedImage) {
            return;
        }
        if (waitingBeforeNextUpload) {
            changeErrorBoxVisibility("show", "Please wait a moment and try again.");
            return;
        }
        toggleUploadInProgressView(false);
        uploadInProgress = true;
        try {
            const response = yield uploadImage(imageFile);
            const jsonStartIndex = response.indexOf("{");
            const jsonEndIndex = response.lastIndexOf("}");
            const { imageLink, success, message } = JSON.parse(response.slice(jsonStartIndex, jsonEndIndex + 1));
            yield delay(700);
            if (!success) {
                toggleUploadInProgressView(true);
            }
            updateUIAfterImageUpload(imageLink, message, success);
            if (!success) {
                return;
            }
            const { container, image } = createnavigationigationContainerWithImage(imageLink);
            const imgLinkContainer = createImageLinkContainer(imageLink);
            container.appendChild(image);
            container.appendChild(imgLinkContainer);
            navigation === null || navigation === void 0 ? void 0 : navigation.appendChild(container);
            (_a = navigation === null || navigation === void 0 ? void 0 : navigation.querySelector("span.no-data")) === null || _a === void 0 ? void 0 : _a.remove();
            isUserUploadedImage = true;
            toggleUploadInProgressView(true);
            handleUploadDelay();
            document.removeEventListener("DOMContentLoaded", attachClickEventTonavigationigationElements);
            attachClickEventTonavigationigationElements();
            yield delay(REUPLOAD_DELAY_MS / 2);
            uploadInProgress = false;
        }
        catch (err) {
            toggleUploadInProgressView(true);
            changeErrorBoxVisibility("show", "Something went wrong!");
            throw new Error(`${err}`); // change it in production to Something went wrong
        }
    });
}
function uploadImage(imageFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append("user-img", imageFile);
        const response = yield fetch("index.php", {
            method: "POST",
            body: formData,
        });
        if (response.ok) {
            return response.text();
        }
        throw new Error("Something went wrong, Please try again");
    });
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toggleUploadInProgressView(hide) {
    const uploadInProgressBox = document.querySelector(".uploading-in-prog-box");
    const uploadContainer = document.querySelector(".upload-box-container");
    if (uploadInProgressBox && uploadContainer) {
        if (!hide) {
            uploadInProgressBox.style.display = "block";
            uploadContainer.style.display = "none";
            return;
        }
        uploadInProgressBox.style.display = "none";
        uploadContainer.style.display = "block";
    }
}
function updateUIAfterImageUpload(imageLink, message, success) {
    var _a;
    if (!success) {
        changeErrorBoxVisibility("show", message);
        return;
    }
    const uploadForm = document.querySelector(".img-input-container");
    const titleElement = document.querySelector(".upload-box-container__content-container .title");
    const reminderElement = document.querySelector(".upload-box-container__content-container .reminder");
    const successImageWrapper = document.querySelector(".success-img-wrapper");
    const orWordElement = uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.nextElementSibling;
    const chooseFileButton = orWordElement === null || orWordElement === void 0 ? void 0 : orWordElement.nextElementSibling;
    const checkIcon = document.createElement("i");
    checkIcon.className = "ri-check-line img-uploaded-avatar";
    const uploadedImage = document.createElement("img");
    uploadedImage.className = "uploaded-picture global-border-raid";
    uploadedImage.src = imageLink;
    uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.classList.replace("has-no-picture", "has-picture");
    successImageWrapper === null || successImageWrapper === void 0 ? void 0 : successImageWrapper.appendChild(checkIcon);
    uploadForm === null || uploadForm === void 0 ? void 0 : uploadForm.appendChild(uploadedImage);
    if (titleElement) {
        titleElement.textContent = message;
    }
    removeHTMLElements(reminderElement, orWordElement, chooseFileButton);
    (_a = titleElement === null || titleElement === void 0 ? void 0 : titleElement.parentElement) === null || _a === void 0 ? void 0 : _a.appendChild(createImageLinkContainer(imageLink));
    addLinkToLocalStorage(imageLink);
}
function restoreDragAndDropImageBox() {
    // Create the main container
    const container = document.createElement("div");
    container.className = "upload-box-container__content-container";
    // Create the success image wrapper
    const successImgWrapper = document.createElement("div");
    successImgWrapper.className = "success-img-wrapper";
    container.appendChild(successImgWrapper);
    // Create the title element
    const title = document.createElement("h3");
    title.className = "title text-center med-black-title";
    title.textContent = "Upload your image";
    container.appendChild(title);
    // Create the reminder element
    const reminder = document.createElement("span");
    reminder.className = "reminder text-center";
    reminder.textContent = "File should be Jpeg, Png,...";
    container.appendChild(reminder);
    // Create the form element
    const form = document.createElement("form");
    form.className =
        "img-input-container global-border-raid has-no-picture fx-full-center";
    form.action = "";
    form.method = "POST";
    form.enctype = "multipart/form-data";
    form.id = "upload-form";
    container.appendChild(form);
    // Create the placeholder image
    const placeholderImg = document.createElement("img");
    placeholderImg.src = "./images/drop_picture_image.svg";
    placeholderImg.alt = "Drop Image";
    placeholderImg.className = "placeholder-img";
    form.appendChild(placeholderImg);
    // Create the tip element
    const tip = document.createElement("span");
    tip.className = "tip";
    tip.textContent = "Drag & Drop Image Here";
    form.appendChild(tip);
    // Create the file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name = "user-img";
    fileInput.id = "img-input";
    fileInput.className = "user-upload-input";
    form.appendChild(fileInput);
    // Create the 'Or' text element
    const orText = document.createElement("span");
    orText.className = "text-center";
    orText.textContent = "Or";
    container.appendChild(orText);
    // Create the 'Choose a file' button
    const chooseFileBtn = document.createElement("button");
    chooseFileBtn.className = "blue-btn";
    chooseFileBtn.id = "choose-file-btn";
    chooseFileBtn.textContent = "Choose a file";
    container.appendChild(chooseFileBtn);
    isUserUploadedImage = false; // setting that the user restored the orignal box
    chooseFileBtn.addEventListener("click", clickTheInput);
    fileInput.addEventListener("change", () => submitTheInput(null));
    form.addEventListener("click", clickTheInput);
    form.addEventListener("dragover", (e) => handleDragOver(e));
    form.addEventListener("dragleave", (e) => handleDragLeave(e));
    form.addEventListener("drop", (e) => handleDrop(e));
    container.classList.add("cloned");
    const uploadContainer = document.querySelector(".upload-box-container");
    // Add container to the parent element
    uploadContainer === null || uploadContainer === void 0 ? void 0 : uploadContainer.replaceChild(container, document.querySelector(".upload-box-container__content-container"));
}
function removeHTMLElements(...elements) {
    if (!elements)
        return;
    for (let i = 0; i < elements.length; i++) {
        if (!elements[i])
            continue;
        elements[i].remove();
    }
}
function createImageLinkContainer(imageLink) {
    const container = document.createElement("div");
    container.classList.add("img-link-container", "global-border-raid");
    const linkElement = document.createElement("span");
    linkElement.classList.add("img-link-container__link");
    linkElement.textContent = imageLink;
    const copyButton = document.createElement("button");
    copyButton.classList.add("img-link-container__copy-btn", "blue-btn");
    copyButton.textContent = "Copy Link";
    copyButton.addEventListener("click", (event) => {
        var _a, _b;
        return copyTextToClipboard((_b = (_a = event.target.previousElementSibling) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : imageLink);
    });
    container.append(linkElement, copyButton);
    return container;
}
const copyTextToClipboard = (text) => navigator.clipboard.writeText(text);
const localStorageKey = "images-links";
function addLinkToLocalStorage(link) {
    var _a;
    if (!localStorage.getItem(localStorageKey)) {
        const data = {
            [localStorageKey]: [link],
        };
        localStorage.setItem(localStorageKey, JSON.stringify(data));
        createnavigationigationButtons();
    }
    else {
        const dataFromStorage = JSON.parse((_a = localStorage.getItem(localStorageKey)) !== null && _a !== void 0 ? _a : "");
        dataFromStorage[localStorageKey].push(link);
        localStorage.setItem(localStorageKey, JSON.stringify(dataFromStorage));
    }
}
function renderStoredLinksInnavigationigation() {
    var _a;
    createnavigationigationButtons();
    const localStorageIsEmpty = !localStorage.getItem(localStorageKey);
    const hasNoDataSpan = !(navigation === null || navigation === void 0 ? void 0 : navigation.contains(navigation.querySelector("span.no-data")));
    if (localStorageIsEmpty && hasNoDataSpan) {
        const noDataSpan = document.createElement("span");
        noDataSpan.classList.add("no-data");
        noDataSpan.textContent = "No stored images found!";
        navigation === null || navigation === void 0 ? void 0 : navigation.appendChild(noDataSpan);
    }
    else {
        const linksFromStorage = JSON.parse((_a = localStorage.getItem(localStorageKey)) !== null && _a !== void 0 ? _a : "");
        linksFromStorage[localStorageKey].forEach((link) => {
            const imageLinkContainer = createImageLinkContainer(link);
            navigation === null || navigation === void 0 ? void 0 : navigation.appendChild(imageLinkContainer);
        });
        const imageContainers = navigation === null || navigation === void 0 ? void 0 : navigation.querySelectorAll(".img-link-container");
        imageContainers === null || imageContainers === void 0 ? void 0 : imageContainers.forEach((element) => {
            var _a, _b;
            const storedLink = (_b = (_a = element.querySelector(".img-link-container__link")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
            const { container, image } = createnavigationigationContainerWithImage(storedLink);
            container.appendChild(image);
            container.appendChild(element);
            navigation === null || navigation === void 0 ? void 0 : navigation.appendChild(container);
        });
    }
}
function createnavigationigationContainerWithImage(imageSource) {
    const container = document.createElement("div");
    container.className = "navigation-elements-container";
    const image = document.createElement("img");
    image.src = imageSource;
    image.className = "global-border-raid";
    return { container, image };
}
function createnavigationigationButtons() {
    if (navigation === null || navigation === void 0 ? void 0 : navigation.querySelector(".icons-container"))
        return;
    const iconsContainer = document.createElement("div");
    iconsContainer.className = "icons-container";
    const clearAllLinksIcon = document.createElement("i");
    clearAllLinksIcon.className =
        "ri-delete-bin-6-line icons-container__clear-all-links";
    const closenavigationIcon = document.createElement("i");
    closenavigationIcon.className =
        "ri-close-fill icons-container__close-navigation";
    closenavigationIcon.addEventListener("click", () => closeAndOpennavigation(true));
    clearAllLinksIcon.addEventListener("click", clearAllLinksFromStorage);
    iconsContainer.append(closenavigationIcon, clearAllLinksIcon);
    navigation === null || navigation === void 0 ? void 0 : navigation.appendChild(iconsContainer);
}
const navigation = document.querySelector(".stored-imgs-links");
const closeAndOpennavigation = (close) => close
    ? navigation === null || navigation === void 0 ? void 0 : navigation.classList.remove("visible")
    : navigation === null || navigation === void 0 ? void 0 : navigation.classList.add("visible");
function clearAllLinksFromStorage() {
    if (!localStorage.getItem(localStorageKey))
        return;
    // Clear links from local storage
    localStorage.removeItem(localStorageKey);
    // Render stored links in navigationigation
    renderStoredLinksInnavigationigation();
    // Restore original box
    restoreDragAndDropImageBox();
    // Remove navigationigation elements
    const navigationElementsContainers = navigation === null || navigation === void 0 ? void 0 : navigation.querySelectorAll(".navigation-elements-container");
    navigationElementsContainers === null || navigationElementsContainers === void 0 ? void 0 : navigationElementsContainers.forEach((container) => container.remove());
}
function attachClickEventTonavigationigationElements() {
    // Select all navigationigation elements within the "stored-imgs-links" container
    const navigationigationElements = document.querySelectorAll(".stored-imgs-links .navigation-elements-container");
    // Attach click event handler to each navigationigation element
    navigationigationElements.forEach((element) => {
        element.addEventListener("click", handlenavigationigationElementClick);
    });
    function handlenavigationigationElementClick(event) {
        var _a, _b;
        // Check if uploading is in progress
        if (uploadInProgress)
            return;
        // Get the clicked link from the navigationigation element
        const clickedLink = (_b = (_a = event.currentTarget.querySelector(".img-link-container__link")) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : "";
        // Get the upload box content container
        const uploadBoxContentContainer = document.querySelector(".upload-box-container__content-container");
        // Get the upload box title and success image
        const uploadBoxTitle = document.querySelector(".upload-box-container__content-container .title");
        const uploadBoxSuccessImg = document.querySelector(".success-img-wrapper");
        if (uploadBoxContentContainer) {
            // Clear the upload box content container
            uploadBoxContentContainer.innerHTML = "";
            // Create an image input container and add a click event listener
            const imageInputContainer = document.createElement("form");
            imageInputContainer.className =
                "img-input-container global-border-raid has-picture fx-full-center";
            imageInputContainer.id = "upload-form";
            imageInputContainer.addEventListener("click", restoreDragAndDropImageBox);
            // Create an image element and set the source to the clicked link
            const imageToShow = document.createElement("img");
            imageToShow.src = clickedLink;
            imageToShow.classList.add("uploaded-picture", "global-border-raid");
            // Append the image to the image input container
            imageInputContainer.appendChild(imageToShow);
            // Append the image input container and create image link container to the upload box content container
            uploadBoxContentContainer.append(imageInputContainer, createImageLinkContainer(clickedLink));
            // Remove Error Box If Showed
            changeErrorBoxVisibility("hide");
        }
        if (uploadBoxTitle && uploadBoxSuccessImg) {
            // Remove the upload box title and success image
            uploadBoxTitle.remove();
            uploadBoxSuccessImg.remove();
        }
    }
}
function changeErrorBoxVisibility(state, message) {
    const box = document.querySelector(".error-box");
    const boxText = box === null || box === void 0 ? void 0 : box.querySelector(".text");
    if (!message || (box && state === "hide" && boxText)) {
        hideErrorBox(box, boxText);
        return;
    }
    if (box && state === "show" && boxText) {
        showErrorBox(box, boxText, message);
    }
}
function hideErrorBox(box, boxText) {
    box === null || box === void 0 ? void 0 : box.classList.remove("show");
    if (boxText) {
        boxText.textContent = "";
    }
}
function showErrorBox(box, boxText, message) {
    box.classList.add("show");
    boxText.textContent = message;
    setTimeout(() => {
        hideErrorBox(box, boxText);
    }, REUPLOAD_DELAY_MS * 3);
}
const initialDelayBorderWidth = (_a = document.querySelector(".delay-border")) === null || _a === void 0 ? void 0 : _a.clientWidth;
function handleUploadDelay() {
    waitingBeforeNextUpload = true;
    const delayBorder = document.querySelector(".delay-border");
    if (!delayBorder)
        return;
    delayBorder.style.width = `${initialDelayBorderWidth}px`;
    delayBorder.classList.add("img-uploaded");
    let elapsedTime = 0;
    const startTime = Date.now(); // Store the start time
    const updateInterval = setInterval(() => {
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime; // Calculate the elapsed time
        if (elapsedTime >= REUPLOAD_DELAY_MS) {
            clearInterval(updateInterval);
            delayBorder.style.width = "0px";
            waitingBeforeNextUpload = false;
        }
        else {
            const remainingTime = REUPLOAD_DELAY_MS - elapsedTime;
            const currentWidth = (remainingTime / REUPLOAD_DELAY_MS) * initialDelayBorderWidth;
            delayBorder.style.width = `${currentWidth}px`;
        }
    }, 250);
}
