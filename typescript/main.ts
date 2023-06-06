const REUPLOAD_DELAY_MS: number = 5000;

interface UploadedImageResponse {
  imageLink: string;
  message: string;
  success: boolean;
}

let isUserUploadedImage: boolean = false;

let uploadInProgress: boolean = false;

let waitingBeforeNextUpload: boolean = false;

const shownavigationigationButton =
  document.querySelector<HTMLButtonElement>(".show-links-btn");

shownavigationigationButton?.addEventListener("click", () =>
  closeAndOpennavigation(false)
);

const chooseFileButton =
  document.querySelector<HTMLButtonElement>("#choose-file-btn");

chooseFileButton?.addEventListener("click", clickTheInput);

const uploadInput = document.querySelector<HTMLInputElement>("#img-input");

uploadInput?.addEventListener("change", () => submitTheInput(null));

const uploadForm = document.querySelector<HTMLFormElement>("#upload-form");

uploadForm?.addEventListener("click", clickTheInput);

uploadForm?.addEventListener("dragover", (e) => handleDragOver(e));

uploadForm?.addEventListener("dragleave", (e) => handleDragLeave(e));

uploadForm?.addEventListener("drop", (e) => handleDrop(e));

const errorBoxCloseButton = document.querySelector<HTMLDivElement>(
  ".error-box .close-box"
);

errorBoxCloseButton?.addEventListener("click", () =>
  changeErrorBoxVisibility("hide")
);

document.addEventListener(
  "DOMContentLoaded",
  renderStoredLinksInnavigationigation
);

document.addEventListener(
  "DOMContentLoaded",
  attachClickEventTonavigationigationElements
);

const isStorageNoticeShowed = localStorage.getItem("storage-notice");

if (!isStorageNoticeShowed) {
  localStorage.setItem("storage-notice", `${true}`);

  changeErrorBoxVisibility(
    "show",
    "This website is intended for practice purposes only, and if you encounter an unexpected error, it is likely due to storage limitations."
  );
}

function clickTheInput(): void {
  if (isUserUploadedImage) {
    restoreDragAndDropImageBox();
    return;
  }

  const uploadInput = document.querySelector<HTMLInputElement>("#img-input");

  changeErrorBoxVisibility("hide"); // if error box showed hide when clicked input
  uploadInput?.click();
}

function submitTheInput(imageArg: File | null): void {
  if (!imageArg) {
    const uploadInput = document.querySelector<HTMLInputElement>("#img-input");

    handleImageUpload(uploadInput?.files ? uploadInput?.files[0] : null);
    return;
  }
  handleImageUpload(imageArg);
}

function handleDragOver(e: DragEvent): void {
  e.preventDefault(); // Prevent Open New Tab

  const target = e.currentTarget as HTMLDivElement;
  const textSpan = target.querySelector<HTMLSpanElement>(".tip");

  if (!target.classList.contains("dragging-img-over")) {
    target.classList.add("dragging-img-over");

    if (textSpan) textSpan.textContent = "Drop Image To Upload";
  }
}

function handleDragLeave(e: DragEvent): void {
  e.preventDefault(); // Prevent Open New Tab

  const target = e.currentTarget as HTMLDivElement;
  const textSpan = target.querySelector<HTMLSpanElement>(".tip");

  if (target.classList.contains("dragging-img-over")) {
    target.classList.remove("dragging-img-over");

    if (textSpan) textSpan.textContent = "Drag & Drop Image Here";
  }
}

function handleDrop(e: DragEvent): void {
  e.preventDefault(); // Prevent Open New Tab

  const image = e.dataTransfer?.files[0];

  if (image) {
    changeErrorBoxVisibility("hide"); // If error box showed hided when drop

    submitTheInput(image); // Setting Input Files To The Dropped File
  }

  handleDragLeave(e);
}

async function handleImageUpload(imageFile: File | null): Promise<void> {
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
    const response = await uploadImage(imageFile);

    const jsonStartIndex = response.indexOf("{");
    const jsonEndIndex = response.lastIndexOf("}");

    const { imageLink, success, message } = JSON.parse(
      response.slice(jsonStartIndex, jsonEndIndex + 1)
    ) as UploadedImageResponse;

    await delay(700);

    if (!success) {
      toggleUploadInProgressView(true);
    }

    updateUIAfterImageUpload(imageLink, message, success);

    if (!success) {
      return;
    }

    const { container, image } =
      createnavigationigationContainerWithImage(imageLink);
    const imgLinkContainer = createImageLinkContainer(imageLink);

    container.appendChild(image);
    container.appendChild(imgLinkContainer);

    navigation?.appendChild(container);
    navigation?.querySelector("span.no-data")?.remove();

    isUserUploadedImage = true;

    toggleUploadInProgressView(true);
    handleUploadDelay();

    document.removeEventListener(
      "DOMContentLoaded",
      attachClickEventTonavigationigationElements
    );

    attachClickEventTonavigationigationElements();

    await delay(REUPLOAD_DELAY_MS / 2);

    uploadInProgress = false;
  } catch (err) {
    toggleUploadInProgressView(true);
    changeErrorBoxVisibility("show", "Something went wrong!");
    throw new Error(`${err}`); // change it in production to Something went wrong
  }
}

async function uploadImage(imageFile: File): Promise<string> {
  const formData = new FormData();

  formData.append("user-img", imageFile);

  const response = await fetch("index.php", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return response.text();
  }

  throw new Error("Something went wrong, Please try again");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toggleUploadInProgressView(hide: boolean): void {
  const uploadInProgressBox = document.querySelector<HTMLDivElement>(
    ".uploading-in-prog-box"
  );

  const uploadContainer = document.querySelector<HTMLDivElement>(
    ".upload-box-container"
  );

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

function updateUIAfterImageUpload(
  imageLink: string,
  message: string,
  success: boolean
): void {
  if (!success) {
    changeErrorBoxVisibility("show", message);
    return;
  }

  const uploadForm = document.querySelector<HTMLDivElement>(
    ".img-input-container"
  );

  const titleElement = document.querySelector<HTMLHeadingElement>(
    ".upload-box-container__content-container .title"
  );

  const reminderElement = document.querySelector<HTMLSpanElement>(
    ".upload-box-container__content-container .reminder"
  );

  const successImageWrapper = document.querySelector(".success-img-wrapper");

  const orWordElement = uploadForm?.nextElementSibling as HTMLSpanElement;

  const chooseFileButton =
    orWordElement?.nextElementSibling as HTMLButtonElement;

  const checkIcon = document.createElement("i");
  checkIcon.className = "ri-check-line img-uploaded-avatar";

  const uploadedImage = document.createElement("img");
  uploadedImage.className = "uploaded-picture global-border-raid";
  uploadedImage.src = imageLink;

  uploadForm?.classList.replace("has-no-picture", "has-picture");

  successImageWrapper?.appendChild(checkIcon);

  uploadForm?.appendChild(uploadedImage);

  if (titleElement) {
    titleElement.textContent = message;
  }

  removeHTMLElements(
    reminderElement as HTMLSpanElement,
    orWordElement,
    chooseFileButton
  );

  titleElement?.parentElement?.appendChild(createImageLinkContainer(imageLink));

  addLinkToLocalStorage(imageLink);
}

function restoreDragAndDropImageBox(): void {
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

  const uploadContainer = document.querySelector<HTMLDivElement>(
    ".upload-box-container"
  );

  // Add container to the parent element
  uploadContainer?.replaceChild(
    container,
    document.querySelector(
      ".upload-box-container__content-container"
    ) as HTMLDivElement
  );
}

function removeHTMLElements(...elements: HTMLElement[]): void {
  if (!elements) return;

  for (let i = 0; i < elements.length; i++) {
    if (!elements[i]) continue;

    elements[i].remove();
  }
}

function createImageLinkContainer(imageLink: string): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("img-link-container", "global-border-raid");

  const linkElement = document.createElement("span");
  linkElement.classList.add("img-link-container__link");
  linkElement.textContent = imageLink;

  const copyButton = document.createElement("button");
  copyButton.classList.add("img-link-container__copy-btn", "blue-btn");
  copyButton.textContent = "Copy Link";

  copyButton.addEventListener("click", (event) =>
    copyTextToClipboard(
      (event.target as HTMLButtonElement).previousElementSibling?.textContent ??
        imageLink
    )
  );

  container.append(linkElement, copyButton);

  return container;
}

const copyTextToClipboard = (text: string): Promise<void> =>
  navigator.clipboard.writeText(text);

const localStorageKey = "images-links";

type LinksFromStorage = {
  [localStorageKey]: string[];
};

function addLinkToLocalStorage(link: string): void {
  if (!localStorage.getItem(localStorageKey)) {
    const data = {
      [localStorageKey]: [link],
    };

    localStorage.setItem(localStorageKey, JSON.stringify(data));

    createnavigationigationButtons();
  } else {
    const dataFromStorage: LinksFromStorage = JSON.parse(
      localStorage.getItem(localStorageKey) ?? ""
    );

    dataFromStorage[localStorageKey].push(link);

    localStorage.setItem(localStorageKey, JSON.stringify(dataFromStorage));
  }
}

function renderStoredLinksInnavigationigation(): void {
  createnavigationigationButtons();

  const localStorageIsEmpty: boolean = !localStorage.getItem(localStorageKey);
  const hasNoDataSpan: boolean = !navigation?.contains(
    navigation.querySelector("span.no-data")
  );

  if (localStorageIsEmpty && hasNoDataSpan) {
    const noDataSpan = document.createElement("span");
    noDataSpan.classList.add("no-data");
    noDataSpan.textContent = "No stored images found!";

    navigation?.appendChild(noDataSpan);
  } else {
    const linksFromStorage: LinksFromStorage = JSON.parse(
      localStorage.getItem(localStorageKey) ?? ""
    );

    linksFromStorage[localStorageKey].forEach((link) => {
      const imageLinkContainer = createImageLinkContainer(link);
      navigation?.appendChild(imageLinkContainer);
    });

    const imageContainers = navigation?.querySelectorAll(".img-link-container");

    imageContainers?.forEach((element) => {
      const storedLink =
        element.querySelector(".img-link-container__link")?.textContent ?? "";

      const { container, image } =
        createnavigationigationContainerWithImage(storedLink);

      container.appendChild(image);
      container.appendChild(element);

      navigation?.appendChild(container);
    });
  }
}

function createnavigationigationContainerWithImage(imageSource: string): {
  container: HTMLDivElement;
  image: HTMLImageElement;
} {
  const container = document.createElement("div");
  container.className = "navigation-elements-container";

  const image = document.createElement("img");
  image.src = imageSource;
  image.className = "global-border-raid";

  return { container, image };
}

function createnavigationigationButtons(): void {
  if (navigation?.querySelector(".icons-container")) return;

  const iconsContainer = document.createElement("div");
  iconsContainer.className = "icons-container";

  const clearAllLinksIcon = document.createElement("i");
  clearAllLinksIcon.className =
    "ri-delete-bin-6-line icons-container__clear-all-links";

  const closenavigationIcon = document.createElement("i");
  closenavigationIcon.className =
    "ri-close-fill icons-container__close-navigation";

  closenavigationIcon.addEventListener("click", () =>
    closeAndOpennavigation(true)
  );
  clearAllLinksIcon.addEventListener("click", clearAllLinksFromStorage);

  iconsContainer.append(closenavigationIcon, clearAllLinksIcon);

  navigation?.appendChild(iconsContainer);
}

const navigation = document.querySelector<HTMLElement>(".stored-imgs-links");

const closeAndOpennavigation = (close: boolean): void =>
  close
    ? navigation?.classList.remove("visible")
    : navigation?.classList.add("visible");

function clearAllLinksFromStorage(): void {
  if (!localStorage.getItem(localStorageKey)) return;

  // Clear links from local storage
  localStorage.removeItem(localStorageKey);

  // Render stored links in navigationigation
  renderStoredLinksInnavigationigation();

  // Restore original box
  restoreDragAndDropImageBox();

  // Remove navigationigation elements
  const navigationElementsContainers = navigation?.querySelectorAll(
    ".navigation-elements-container"
  );

  navigationElementsContainers?.forEach((container) => container.remove());
}

function attachClickEventTonavigationigationElements(): void {
  // Select all navigationigation elements within the "stored-imgs-links" container
  const navigationigationElements = document.querySelectorAll(
    ".stored-imgs-links .navigation-elements-container"
  );

  // Attach click event handler to each navigationigation element
  navigationigationElements.forEach((element) => {
    element.addEventListener("click", handlenavigationigationElementClick);
  });

  function handlenavigationigationElementClick(event: Event): void {
    // Check if uploading is in progress
    if (uploadInProgress) return;

    // Get the clicked link from the navigationigation element
    const clickedLink =
      (event.currentTarget as HTMLDivElement).querySelector(
        ".img-link-container__link"
      )?.textContent ?? "";

    // Get the upload box content container
    const uploadBoxContentContainer = document.querySelector(
      ".upload-box-container__content-container"
    );

    // Get the upload box title and success image
    const uploadBoxTitle = document.querySelector<HTMLHeadingElement>(
      ".upload-box-container__content-container .title"
    );
    const uploadBoxSuccessImg = document.querySelector<HTMLDivElement>(
      ".success-img-wrapper"
    );

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
      uploadBoxContentContainer.append(
        imageInputContainer,
        createImageLinkContainer(clickedLink)
      );

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

function changeErrorBoxVisibility(
  state: "hide" | "show",
  message?: string
): void {
  const box = document.querySelector<HTMLDivElement>(".error-box");
  const boxText = box?.querySelector(".text");

  if (!message || (box && state === "hide" && boxText)) {
    hideErrorBox(box, boxText);
    return;
  }

  if (box && state === "show" && boxText) {
    showErrorBox(box, boxText, message);
  }
}

function hideErrorBox(
  box: HTMLDivElement | null,
  boxText: Element | null | undefined
): void {
  box?.classList.remove("show");
  if (boxText) {
    boxText.textContent = "";
  }
}

function showErrorBox(
  box: HTMLDivElement,
  boxText: Element,
  message: string
): void {
  box.classList.add("show");
  boxText.textContent = message;

  setTimeout(() => {
    hideErrorBox(box, boxText);
  }, REUPLOAD_DELAY_MS * 3);
}

const initialDelayBorderWidth: number = document.querySelector<HTMLSpanElement>(
  ".delay-border"
)?.clientWidth as number;

function handleUploadDelay(): void {
  waitingBeforeNextUpload = true;

  const delayBorder = document.querySelector<HTMLSpanElement>(".delay-border");
  if (!delayBorder) return;

  delayBorder.style.width = `${initialDelayBorderWidth}px`;
  delayBorder.classList.add("img-uploaded");

  let elapsedTime: number = 0;
  const startTime = Date.now(); // Store the start time

  const updateInterval = setInterval(() => {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime; // Calculate the elapsed time

    if (elapsedTime >= REUPLOAD_DELAY_MS) {
      clearInterval(updateInterval);
      delayBorder.style.width = "0px";
      waitingBeforeNextUpload = false;
    } else {
      const remainingTime = REUPLOAD_DELAY_MS - elapsedTime;
      const currentWidth =
        (remainingTime / REUPLOAD_DELAY_MS) * initialDelayBorderWidth;
      delayBorder.style.width = `${currentWidth}px`;
    }
  }, 250);
}
