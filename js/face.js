const face = {
    webcamElement: document.getElementById('webcam'),
    capturedDescriptors: [],
    init: function() {
        this.loadModels().then(() => this.startWebcam());
        this.addEventListeners();
    },
    loadModels: function() {
        return Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('face-api'),
            faceapi.nets.faceLandmark68Net.loadFromUri('face-api'),
            faceapi.nets.faceRecognitionNet.loadFromUri('face-api'),
            faceapi.nets.ssdMobilenetv1.loadFromUri('face-api')
        ]);
    },
    startWebcam: function() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                this.webcamElement.srcObject = stream;
                this.webcamElement.addEventListener('play', () => this.onPlay());
            })
            .catch(err => {
                console.error("Error starting webcam: ", err);
                UIkit.notification({message: 'Error starting webcam.', status: 'danger'});
            });
    },
    onPlay: async function() {
        const canvas = faceapi.createCanvasFromMedia(this.webcamElement);
        let videoContainer;
        if (window.location.pathname === '/login') {
            videoContainer = document.querySelector('.uk-margin[style*="position: relative"]');
        } else if (window.location.pathname === '/register') {
            videoContainer = this.webcamElement.parentElement;
        }
        videoContainer.append(canvas);
        faceapi.matchDimensions(canvas, { width: this.webcamElement.width, height: this.webcamElement.height });
        $(canvas).css('position', 'absolute');
        $(canvas).css('top', '0');
        $(canvas).css('left', '0');

        const videoContainerParent = $(videoContainer);
        videoContainerParent.addClass('glow-border');
        $('#loader').show();

        if (window.location.pathname === '/login') {
            const users = await this.getUsers();

            videoContainerParent.removeClass('glow-border');
            $('#loader').hide();
            $('#skeleton-loader').hide();

            if (users.length === 0) {
                $('.uk-container').html('<div class="uk-alert-danger" uk-alert><a href class="uk-alert-close" uk-close></a><p>No users found. Please register.</p></div><a href="/register" class="uk-button uk-button-default">Register</a>');
                return;
            }
            $('a[href="/register"]').show();

            const labeledFaceDescriptors = this.getLabeledFaceDescriptors(users);
            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

            this.onFrame(canvas, faceMatcher, users);
        } else {
            videoContainerParent.removeClass('glow-border');
            $('#loader').hide();
        }
    },
    onFrame: async function(canvas, faceMatcher, users) {
        if (this.webcamElement.paused || this.webcamElement.ended) {
            return setTimeout(() => this.onFrame(canvas, faceMatcher, users));
        }

        const detections = await faceapi.detectAllFaces(this.webcamElement).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, { width: this.webcamElement.width, height: this.webcamElement.height });
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        resizedDetections.forEach(detection => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            const box = detection.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() });
            drawBox.draw(canvas);
            if (bestMatch.label !== 'unknown') {
                this.currentUser = users.find(u => u.name === bestMatch.label);
                $('#login-face').show();
            } else {
                this.currentUser = null;
                $('#login-face').hide();
            }
        });
        setTimeout(() => this.onFrame(canvas, faceMatcher, users));
    },
    getUsers: function() {
        return $.ajax({
            type: 'GET',
            url: '/api/users',
            dataType: 'json'
        });
    },
    getLabeledFaceDescriptors: function(users) {
        return users.map(user => {
            const descriptors = user.descriptors.map(desc => new Float32Array(Object.values(desc)));
            return new faceapi.LabeledFaceDescriptors(user.name, descriptors);
        });
    },
    addEventListeners: function() {
        $('#login-face').on('click', () => this.login());
        $('#capture-face').on('click', () => this.captureFace());
        $('#image-upload').on('change', () => this.toggleWebcam());
        $('#upload-image').on('click', () => this.uploadImage());
        $('#register-form').on('submit', (e) => this.register(e));
    },
    login: function() {
        if (this.currentUser) {
            $.ajax({
                type: 'POST',
                url: '/login',
                data: JSON.stringify({ email: this.currentUser.email }),
                contentType: 'application/json',
                success: function(response) {
                    UIkit.notification({message: 'Login successful!', status: 'success'});
                    window.location.href = '/dashboard';
                },
                error: function(error) {
                    UIkit.notification({message: 'Login failed.', status: 'danger'});
                }
            });
        }
    },
    captureFace: async function() {
        const detection = await faceapi.detectSingleFace(this.webcamElement).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
            this.capturedDescriptors.push(detection.descriptor);
            UIkit.notification({message: `Captured face descriptor ${this.capturedDescriptors.length}/5`, status: 'success'});
            if (this.capturedDescriptors.length >= 5) {
                $('#capture-face').prop('disabled', true);
                UIkit.notification({message: 'Maximum face descriptors captured.', status: 'primary'});
            }
        } else {
            UIkit.notification({message: 'No face detected.', status: 'danger'});
        }
    },
    toggleWebcam: function() {
        if ($('#image-upload').val()) {
            $('#webcam').hide();
            $('#capture-face').hide();
        } else {
            $('#webcam').show();
            $('#capture-face').show();
        }
    },
    uploadImage: async function() {
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload.files.length > 0) {
            const image = await faceapi.bufferToImage(imageUpload.files[0]);
            const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
                this.capturedDescriptors.push(detection.descriptor);
                UIkit.notification({message: `Captured face descriptor ${this.capturedDescriptors.length}/5`, status: 'success'});
                if (this.capturedDescriptors.length >= 5) {
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
    },
    register: function(e) {
        e.preventDefault();
        const name = $('#name').val();
        const email = $('#email').val();

        if (this.capturedDescriptors.length < 5) {
            UIkit.notification({message: 'Please capture 5 face descriptors.', status: 'warning'});
            return;
        }

        const data = {
            name: name,
            email: email,
            descriptors: this.capturedDescriptors
        };

        $.ajax({
            type: 'POST',
            url: '/register',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                UIkit.notification({message: 'Registration successful!', status: 'success'});
                window.location.href = '/';
            },
            error: function(error) {
                UIkit.notification({message: 'Registration failed.', status: 'danger'});
            }
        });
    }
};

face.init();
