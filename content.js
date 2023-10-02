console.log("Hi, I have been injected whoopie!!!");

var recorder = null;
function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });
  };



 
  recorder.ondataavailable = function (event) {
    let recordedBlob = event.data;


    let formData = new FormData();
    formData.append("video", recordedBlob, "screen-recording.webm");

    let endpointUrl = "https://amara-hngtask-chrome-extension.onrender.com/api/upload";


    fetch(endpointUrl, {
      method: "POST",
     
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
       
      })
      .then((data) => {
        console.log("Video uploaded successfully:", data);
        let videoViewUrl = "https://hng-help-me-out.vercel.app/video/sample"; 
        window.open(videoViewUrl, "_blank" ) ;
      })
      .catch((error) => {
        console.error("Error uploading video:", error);
      });
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");

    sendResponse(`processed: ${message.action}`);

    const audioPreference = message.audioPreference;
    const videoPreference = message.videoPreference;

    const mediaConstraints = {
      audio: audioPreference,
      video: videoPreference
        ? {
            width: 9999999999,
            height: 9999999999,
          }
        : false,
    };

    navigator.mediaDevices
      .getDisplayMedia(mediaConstraints)
      .then((stream) => {
        onAccessApproved(stream);
      })
      .catch((error) => {
        alert("Media Access Error: Enable Video capture.");
        console.error("Error accessing media devices:", error);
      });
  }

  if (message.action === "stopvideo") {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");

    recorder.stop();
  }
});
