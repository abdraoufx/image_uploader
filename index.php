<?php

define('DELAY_TO_REUPLOAD', 10);
define('IMAGE_MAX_SIZE', 2 * 1024 * 1024); // 2MB

session_start([
    "name" => "_s", // session
    "cookie_httponly" => true,
]);

header_remove('X-Powered-By');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    session_regenerate_id(true);

    // Preventing User From Uploading Mutiple Times
    if (isset($_SESSION['last_upload_time'])) {
        $lastUploadTime = $_SESSION['last_upload_time'];
        $currentTime = time();

        if ($currentTime - $lastUploadTime <= constant('DELAY_TO_REUPLOAD')) {
            echo json_encode([
                "success" => false,
                "message" => "Please wait a moment and try again.",
            ]);
            exit;
        }
    } else if (!isset($_SESSION['last_upload_time'])) {

        echo json_encode([
            "success" => false,
            "message" => "Something went wrong!",
        ]);

        setLastUploadTime();
        exit;
    }

    $userUploadedImage = $_FILES['user-img'];

    if (isset($userUploadedImage)) {
        $imageName = $userUploadedImage['name'];
        $imageSize = $userUploadedImage['size'];
        $imageType = $userUploadedImage['type'];
        $imageTempLocation = $userUploadedImage['tmp_name'];
        $imageUploadingError = $userUploadedImage['error'];

        $imageExtensionsArray = explode('.', $imageName);
        $imageExtension = end($imageExtensionsArray);

        setLastUploadTime();

        // No Image Uploaded
        if ($imageUploadingError === 4) {
            echo json_encode([
                "success" => false,
                "message" => "No image uploaded!",
            ]);
            exit;
        } else {
            if (!checkImageSize($imageSize)) {
                echo json_encode([
                    "success" => false,
                    "message" => "The file size is too large. Please upload a smaller image!",
                ]);
                exit;
            } else if (!checkImageExtension($imageExtension) || !checkMIMEType($imageType) || !checkNullByteInjection($imageTempLocation)) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid image",
                ]);
                exit;
            } else {
                $response = uploadTheImage($imageExtension, $imageTempLocation, $imageName);

                echo json_encode($response);

                exit;
            }
        }
    } else {
        header("HTTP/1.1 400 Bad Request");
        echo "Missing parameters.";
        exit;
    }
}

function checkImageSize($imageSize): bool
{
    if ($imageSize > constant('IMAGE_MAX_SIZE')) {
        return false;
    }

    return true;
}

function checkImageExtension($imageExtension): bool
{
    $allowedExtensions = ['jpg', 'jpeg', 'png'];

    if (!in_array(strtolower($imageExtension), $allowedExtensions)) {
        return false;
    }

    return true;
}

function checkMIMEType($type): bool
{
    $allowedTypes = ["image/jpg", "image/jpeg", "image/png"];

    if (!in_array(strtolower($type), $allowedTypes)) {
        return false;
    }

    return true;
}

function changeImageName($imageExtension): string
{
    $newName = md5(uniqid()) . "." . $imageExtension;

    return $newName;
}

function checkNullByteInjection($imagePath): bool
{
    if (getimagesize($imagePath) === false) {
        return false;
    }
    return true;
}

function uploadTheImage($imageExtension, $imageTempLocation)
{
    $uploadDir = "uploaded-images/";

    $imagePath = $uploadDir . changeImageName($imageExtension);

    $currentHTTPEncryption = stripos($_SERVER['SERVER_PROTOCOL'], 'https') === 0 ? 'https://' : 'http://';

    $imageLink =  $currentHTTPEncryption . $_SERVER['SERVER_NAME'] . "/" . $imagePath;

    move_uploaded_file($imageTempLocation, $imagePath);

    return [
        "imageLink" => $imageLink,
        "success" => true,
        "message" => "uploaded successfully!",
    ];
}

function setLastUploadTime()
{
    $_SESSION['last_upload_time'] = time();
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Image Uploader</title>
    <link rel="stylesheet" href="styles/sass/main.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.2.0/fonts/remixicon.css" rel="stylesheet" />
</head>

<body>
    <main class="main-page fx-full-center">
        <div class="upload-box-container app-containers-width containers-padding global-box-shadow global-border-raid">
            <span class="delay-border"></span>
            <div class="upload-box-container__content-container">
                <div class="success-img-wrapper"></div>
                <h3 class="title text-center med-black-title">Upload your image</h3>
                <span class="reminder text-center">File should be Jpeg, Png,...</span>
                <form class="img-input-container global-border-raid has-no-picture fx-full-center" enctype="multipart/form-data" id="upload-form">
                    <img src="./images/drop_picture_image.svg" alt="Drop Image" class="placeholder-img" />
                    <span class="tip">Drag & Drop Image Here</span>
                    <input type="file" name="user-img" id="img-input" class="user-upload-input" />
                </form>
                <span class="text-center">Or</span>
                <button class="blue-btn" id="choose-file-btn">Choose a file</button>
            </div>
        </div>
        <div class="uploading-in-prog-box app-containers-width containers-padding global-box-shadow global-border-raid" style="display: none">
            <h3 class="title med-black-title">Uploading...</h3>
            <div class="loader-container">
                <span class="loader-container__loader"></span>
            </div>
        </div>
        <button class="blue-btn show-links-btn">Show Stored Images Links</button>
        <nav class="stored-imgs-links global-box-shadow"></nav>
        <div class="error-box global-box-shadow">
            <div class="icon-wrapper">
                <i class="ri-close-circle-fill close-box"></i>
            </div>
            <span class="text"></span>
        </div>
    </main>
    <script src="js/main.js" defer></script>
</body>

</html>