const webcamElement = document.getElementById('webcam');
let capturedDescriptors = [];

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('play', onPlay);
        })
        .catch(err => {
            console.error("Error starting webcam: ", err);
            UIkit.notification({message: 'Error starting webcam.', status: 'danger'});
        });
}

async function onPlay() {
    try {
        const canvas = faceapi.createCanvasFromMedia(webcamElement);
        const videoContainer = document.getElementById('video-container');
        if (!videoContainer) {
            throw new Error('Video container not found');
        }
        videoContainer.append(canvas);
        faceapi.matchDimensions(canvas, { width: webcamElement.width, height: webcamElement.height });
        $(canvas).css('position', 'absolute');
        $(canvas).css('top', '0');
        $(canvas).css('left', '0');

        const videoContainerParent = $('#video-container');
        videoContainerParent.addClass('glow-border');
        $('#loader').show();

        const users = await $.ajax({
            type: 'GET',
            url: 'users.php',
            dataType: 'json'
        });

        videoContainerParent.removeClass('glow-border');
        $('#loader').hide();
        $('#skeleton-loader').hide();

        if (users.length === 0) {
            $('.uk-container').html('<div class="uk-alert-danger" uk-alert><a href class="uk-alert-close" uk-close></a><p>No users found. Please register.</p></div><a href="register.html" class="uk-button uk-button-default">Register</a>');
            return;
        }

        const labeledFaceDescriptors = users.map(user => {
            const descriptors = user.descriptors.map(desc => new Float32Array(Object.values(desc)));
            return new faceapi.Labeled_face_descriptors(user.name, descriptors);
        });
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        let forwardTimes = [];
        let currentUser = null;

        async function onFrame() {
            if (webcamElement.paused || webcamElement.ended) {
                return setTimeout(() => onFrame());
            }

            const ts = Date.now();
            const detections = await faceapi.detectAllFaces(webcamElement).withFaceLandmarks().withFaceDescriptors();
            forwardTimes = [Date.now() - ts].concat(forwardTimes).slice(0, 30);
            const resizedDetections = faceapi.resizeResults(detections, { width: webcamElement.width, height: webcamElement.height });
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            resizedDetections.forEach(detection => {
                const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                const box = detection.detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
                drawBox.draw(canvas);
                if (bestMatch.label !== 'unknown') {
                    currentUser = users.find(u => u.name === bestMatch.label);
                    $('#login-face').show();
                } else {
                    currentUser = null;
                    $('#login-face').hide();
                }
            });
            setTimeout(() => onFrame());
        }
        onFrame();

        $('#login-face').on('click', async () => {
            if (currentUser) {
                $.ajax({
                    type: 'POST',
                    url: 'login.php',
                    data: JSON.stringify({ email: currentUser.email }),
                    contentType: 'application/json',
                    success: function(response) {
                        UIkit.notification({message: 'Login successful!', status: 'success'});
                        window.location.href = 'dashboard.php';
                    },
                    error: function(error) {
                        UIkit.notification({message: 'Login failed.', status: 'danger'});
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error in onPlay: ", err);
        UIkit.notification({message: 'An error occurred during face detection setup. Please try again.', status: 'danger'});
    }
}

$('#capture-face').on('click', async () => {
    const detection = await faceapi.detectSingleFace(webcamElement).withFaceLandmarks().withFaceDescriptor();
    if (detection) {
        capturedDescriptors.push(detection.descriptor);
        UIkit.notification({message: `Captured face descriptor ${capturedDescriptors.length}/5`, status: 'success'});
        if (capturedDescriptors.length >= 5) {
            $('#capture-face').prop('disabled', true);
            UIkit.notification({message: 'Maximum face descriptors captured.', status: 'primary'});
        }
    } else {
        UIkit.notification({message: 'No face detected.', status: 'danger'});
    }
});

$('#image-upload').on('change', () => {
    if ($('#image-upload').val()) {
        $('#webcam').hide();
        $('#capture-face').hide();
    } else {
        $('#webcam').show();
        $('#capture-face').show();
    }
});

$('#upload-image').on('click', async () => {
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload.files.length > 0) {
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
            capturedDescriptors.push(detection.descriptor);
            UIkit.notification({message: `Captured face descriptor ${capturedDescriptors.length}/5`, status: 'success'});
            if (capturedDescriptors.length >= 5) {
                $('#capture-face').prop('disabled', true);
                $('#upload-image').prop('disabled', true);
                UIkit.notification({message: 'Maximum face descriptors captured.', status: 'primary'});
            }
        } else {
            UIkit.notification({message: 'No face detected in the uploaded image.', status: 'danger'});
        }
    } else {
        UIkit.notification({message: 'Please select an image file.', status: 'warning'});
    }
});

$('#register-form').on('submit', async (e) => {
    e.preventDefault();
    const name = $('#name').val();
    const email = $('#email').val();

    if (capturedDescriptors.length < 5) {
        UIkit.notification({message: 'Please capture 5 face descriptors.', status: 'warning'});
        return;
    }

    const data = {
        name: name,
        email: email,
        descriptors: capturedDescriptors
    };

    $.ajax({
        type: 'POST',
        url: 'register.php',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
            UIkit.notification({message: 'Registration successful!', status: 'success'});
            window.location.href = 'index.html';
        },
        error: function(error) {
            UIkit.notification({message: 'Registration failed.', status: 'danger'});
        }
    });
});

$(document).ready(function() {
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('face-api'),
        faceapi.nets.faceLandmark68Net.loadFromUri('face-api'),
        faceapi.nets.faceRecognitionNet.loadFromUri('face-api'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('face-api')
    ]).then(startWebcam);
});
