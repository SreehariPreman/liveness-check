const video = document.getElementById('video');

let click_button = document.getElementById('click-photo').disabled=true;
let canvas = document.getElementById("canvas");


document.getElementById('click-photo').onclick = function() {
    //  document.getElementById("video").style.display = "none";
        
    document.getElementById("jainus-message").innerHTML = 'congrats..liveness test successfull.For more info check whatsapp';
    let image_data_url = canvas.toDataURL('image/jpeg');
//    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log(image_data_url)
    const dataa = {
        "urn": "{{urn}}",
        "next": "{{next}}"
    };
    var url = "https://nudgebay.net/facerecognized/";
    var xhr = new XMLHttpRequest();
    // const thisVideo = $('#thisVideo').get(0)
    // const successMessage = $('#successMessage').get(0);
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            
            // $('#thisVideo').hide();

        } else {
            // $('#thisVideo').hide();
            setUserMessage("Ooops Something is wrong, plese refresh the page and try again.")
        }
    };
    var data = JSON.stringify(dataa);
    xhr.send(data);
}

function startVideo() {
  navigator.mediaDevices.getUserMedia({
    video: true
}).then(
    stream => (video.srcObject = stream),
    err => console.log(err)
  )
}

var completedTaskCount = 0;
var jainusTasks = [
    {
      "id": "1",
      "message": "Turn your face towards left",
      "success": false
     },
    {
      "id": "2",
      "message": "Smile please",
      "success": false
     },
    {
      "id": "3",
      "message": "Turn your face upward",
      "success": false
    },
    {
       "id": "4",
      "message": "Turn your face towards right ",
      "success": false
     }
    ];
var jainusTaskIndex = Math.floor(Math.random() * 3);
var jainusTask;

function setUserMessage(m) {
   document.getElementById("jainus-message").innerHTML = m;
}
function nextTask() {
  
    jainusTaskIndex = ((jainusTaskIndex + 1) == jainusTasks.length)
        ? 0 : jainusTaskIndex + 1;
    jainusTask = jainusTasks[jainusTaskIndex];
    setUserMessage(jainusTask["message"]);
}


function showSuccessAndNextTask() {
    if (completedTaskCount <= jainusTasks.length) {
        //setUserMessage("Done");
        
     
        nextTask();
       // setTimeout(() => nextTask(), 2500);

    } if (completedTaskCount == jainusTasks.length){
        
        setUserMessage("Completed !!");
        let click_button = document.getElementById('click-photo').disabled=false;
    }
}
nextTask();



Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
//  faceapi.nets.FaceLandmark68TinyNet.loadFromUri('/Face-Detection-JavaScript-master/models'),


]).then(startVideo)



function getTop(l) {
  return l
    .map((a) => a.y)
    .reduce((a, b) => Math.min(a, b));
}

function getMeanPosition(l) {
  return l
    .map((a) => [a.x, a.y])
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]])
    .map((a, number) => a / l.length);
}

video.addEventListener('play', () => {
  setInterval(async () => {

    await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceExpressions()
        .then((res) => {

            // Face is detected
            if (res) {
                var eye_right = getMeanPosition(res.landmarks.getRightEye());
                var eye_left = getMeanPosition(res.landmarks.getLeftEye());
                var nose = getMeanPosition(res.landmarks.getNose());
                var mouth = getMeanPosition(res.landmarks.getMouth());
                var jaw = getTop(res.landmarks.getJawOutline());

                var rx = (jaw - mouth[1]) / res.detection.box.height + 0.5;
                var ry = (eye_left[0] + (eye_right[0] - eye_left[0]) / 2 - nose[0]) /
                    res.detection.box.width;


                let state = "undetected";

                if (res.detection.score > 0.3) {
                    state = "front";

                    if (rx > 0.2) {
                        state = "top";
                        if (jainusTask["id"] == 3) {
                            completedTaskCount += 1;
                            showSuccessAndNextTask();
                        }

                    } else {
                        if (ry < -0.03) {
                            state = "left";
                            if (jainusTask["id"] == 1) {
                                completedTaskCount += 1;
                                showSuccessAndNextTask();
                            }

                        }
                        if (ry > 0.03) {
                            state = "right";
                            if (jainusTask["id"] == 4) {
                                completedTaskCount += 1;
                                showSuccessAndNextTask();
                            }
                        }
                    }
                }
            } else {
                state = "not detected";
            }
        })

       })
      })

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    if (detections && detections[0] && detections[0].expressions) {
        isUsingCamera = true
        if (isSmiling(detections[0].expressions)) {
            currentSmileStatus = true
             if (jainusTask["id"] == 2) {
                completedTaskCount += 1;
                showSuccessAndNextTask();
             }
        }
    }
  }, 100)
})


let currentSmileStatus = false

function isSmiling(expressions) {
    // filtering false positive
    const maxValue = Math.max(
        ...Object.values(expressions).filter(value => value <= 1)
    )

    const expressionsKeys = Object.keys(expressions)
    const mostLikely = expressionsKeys.filter(
        expression => expressions[expression] === maxValue
    )

    if (mostLikely[0] && mostLikely[0] == 'happy')
        return true

    return false
}



