// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, where , query, getDocs, collection, getCountFromServer} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuGqUNO-61s5l1eEnZDN2RV2qvtrTNfp4",
  authDomain: "interviewapp-6083d.firebaseapp.com",
  projectId: "interviewapp-6083d",
  storageBucket: "interviewapp-6083d.appspot.com",
  messagingSenderId: "417828000872",
  appId: "1:417828000872:web:45ffa9bc7572eb7c4b17dd",
  measurementId: "G-MERW8KK43H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const coll = collection(db, "questions");

const count = await setCount();

async function getCount() {
    const collectioz = collection(db, "questions");
    const snapshot = await getCountFromServer(collectioz);
    console.log(snapshot.data().count)
    return snapshot.data().count;
}

async function setCount() {
    return getCount().then(x => {
        return x;
    })
}


let usedNums = [];

async function getRandom(db) {
    let numQues = await setCount();
    console.log("NUMQUES = " + numQues);
    let random = Math.floor(Math.random() * numQues + 1);
    console.log("random=" + random);
    //base case
    if (usedNums.length === count){
        stopRecording();
        return;
    }
    else if(!usedNums.includes(random)) {
        const q = query(coll, where("number", "==", random));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            document.getElementById("main-question").textContent = doc.data().question;
        })
        usedNums.push(random);
        console.log(usedNums);
    } else if (usedNums.includes(random) ){
        getRandom(db);
    } 
}



const videoButton = document.getElementById("main_video-button");
const video = document.getElementById("main_video");
const downloadButton = document.getElementById("download-button");
const nextButton = document.getElementById("next-button");
const questionBox = document.getElementById("questionBox");
const thankYouBox = document.getElementById("thankYouBox");
const interviewButton = document.getElementById("interview-button");


let mediaRecorder;
let recordedBlobs;

videoButton.onclick = () => {
    switch(videoButton.textContent) {
        case 'Record':
            videoButton.textContent = 'Stop';
            startRecording();
            break;
        
        case 'Stop':
            videoButton.textContent = 'Record';
            stopRecording();
            break;
    }
}


interviewButton.onclick = () => {
    init();
}

nextButton.onclick = () => {
    getRandom(db);
}

async function init() {
    try{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }); 
        usedNums = [];
        startWebCamera(stream);
        videoButton.textContent = 'Record';
        videoButton.removeAttribute("hidden");
        downloadButton.style.display = "none";
        questionBox.removeAttribute("hidden");
        thankYouBox.setAttribute("hidden", "hidden");
    } catch (err) {
        console.log("Error retrieving media device");
        console.log(err)
    }
    
} 

function startWebCamera(stream) {
    video.srcObject = stream;
    window.stream = stream;
}

function startRecording(){
    recordedBlobs = []
    
    if(video.srcObject === null) {
        video.srcObject = window.stream;
    }
    mediaRecorder = new MediaRecorder(window.stream, {mineType: 'video/webm;codecs=vp9,opus'})
    mediaRecorder.start();
    mediaRecorder.ondataavailable = recordVideo; 
}

function recordVideo(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data)
        video.srcObject = null;
        let videoUrl = URL.createObjectURL(event.data);
        video.src = videoUrl;
    }
}

function stopRecording() {
    mediaRecorder.stop();
    video.controls = true;
    downloadButton.style.display = "inline";
    videoButton.setAttribute("hidden" , "hidden");
    questionBox.setAttribute("hidden", "hidden");
    thankYouBox.removeAttribute("hidden");
}


downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'mockInterview.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() =>{
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
});


init();




