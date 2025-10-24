// --- Webcam setup ---
const video = document.getElementById('video');
const videoReg = document.getElementById('videoReg');

// Start both video streams (reuse same stream for simplicity)
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  video.srcObject = stream;
  videoReg.srcObject = stream;
})
.catch(err => alert('Webcam error: ' + err));


// --- RECOGNITION CAPTURE ---
document.getElementById('capture').addEventListener('click', () => {
  captureAndSend(video, '/', 'result');
});


// --- REGISTRATION CAPTURE ---
document.getElementById('captureReg').addEventListener('click', () => {
  const name = document.getElementById('regName').value.trim();
  if (!name) {
    alert("Please enter your name before capturing.");
    return;
  }
  captureAndSend(videoReg, '/register', 'registerResult', name);
});


// --- Capture helper function ---
function captureAndSend(videoElem, url, resultElemId, name = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  canvas.getContext('2d').drawImage(videoElem, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    const fd = new FormData();
    fd.append('image', blob, 'capture.png');
    if (name) fd.append('name', name);
    fetch(url, { method: 'POST', body: fd })
      .then(r => r.text())
      .then(text => document.getElementById(resultElemId).innerHTML = text)
      .catch(err => alert('Error: ' + err));
  }, 'image/png');
}


// --- Upload form for recognition ---
document.getElementById('uploadForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  fetch('/', { method: 'POST', body: fd })
    .then(r => r.text())
    .then(html => document.getElementById('result').innerHTML = html)
    .catch(err => alert('Error: ' + err));
});


// --- Upload form for registration ---
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  fetch('/register', { method: 'POST', body: fd })
    .then(r => r.text())
    .then(text => document.getElementById('registerResult').innerHTML = text)
    .catch(err => alert('Error: ' + err));
});
