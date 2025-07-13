const webcamElement = document.getElementById('webcam');
const canvas = document.createElement('canvas');
const webcam = new faceapi.Webcam(webcamElement, 'user', canvas);
let capturedDescriptors = [];

async function startWebcam() {
    await webcam.start();
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
    faceapi.nets.tinyFaceDetector.loadFromUri('/face-api'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/face-api'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/face-api'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/face-api')
]).then(startWebcam);
