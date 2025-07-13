const webcamElement = document.getElementById('webcam');
let capturedDescriptors = [];

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            webcamElement.srcObject = stream;
        })
        .catch(err => {
            console.error("Error starting webcam: ", err);
            UIkit.notification({message: 'Error starting webcam.', status: 'danger'});
        });
}

$('#login-face').on('click', async () => {
    const detection = await faceapi.detectSingleFace(webcamElement).withFaceLandmarks().withFaceDescriptor();
    if (detection) {
        $.ajax({
            type: 'GET',
            url: 'users.php',
            success: function(response) {
                const users = JSON.parse(response);
                const labeledFaceDescriptors = users.map(user => {
                    const descriptors = user.descriptors.map(desc => new Float32Array(Object.values(desc)));
                    return new faceapi.LabeledFaceDescriptors(user.email, descriptors);
                });
                const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
                const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

                if (bestMatch.label !== 'unknown') {
                    $.ajax({
                        type: 'POST',
                        url: 'login.php',
                        data: JSON.stringify({ email: bestMatch.label }),
                        contentType: 'application/json',
                        success: function(response) {
                            UIkit.notification({message: 'Login successful!', status: 'success'});
                            window.location.href = 'dashboard.php';
                        },
                        error: function(error) {
                            UIkit.notification({message: 'Login failed.', status: 'danger'});
                        }
                    });
                } else {
                    UIkit.notification({message: 'Face not recognized.', status: 'danger'});
                }
            }
        });
    } else {
        UIkit.notification({message: 'No face detected.', status: 'danger'});
    }
});

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

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('face-api'),
    faceapi.nets.faceLandmark68Net.loadFromUri('face-api'),
    faceapi.nets.faceRecognitionNet.loadFromUri('face-api'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('face-api')
]).then(startWebcam());
