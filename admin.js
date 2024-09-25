// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, doc, where , query, getDocs, collection, getCountFromServer, addDoc, deleteDoc, orderBy, updateDoc, setDoc, limit} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
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
const questionList = document.querySelector('#question-list');
const form = document.querySelector("#add-question-form");



//THIS DOES EVERYTHING FOR ADMIN.HTML
async function displayAllDocs(){
    const questionRef = collection(db, 'questions');
    const q = query(questionRef, orderBy("number"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        let li = document.createElement('li');
        li.className = "question-li";
        // let quesNum = document.createElement('span');
        
        // let question = document.createElement('span');
        
        let cross = document.createElement('span');
        cross.className = "remove-button";

        li.setAttribute('data-id', doc.id);
        // quesNum.textContent = doc.data().number;
        // quesNum.textContent += ". " 

        // question.textContent = doc.data().question;
        li.appendChild(document.createTextNode(doc.data().question));
        cross.textContent = 'x';

        // li.appendChild(quesNum);
        // li.appendChild(question);
        li.appendChild(cross);

        questionList.appendChild(li);

        cross.addEventListener('click', (e) => {
            let id = e.target.parentElement.getAttribute('data-id');
            deleteDocument(id);
        })
    });

    
}

async function deleteDocument(id){
    const ques = await getQuestionFromLast();
    const num = await getNumberFromLast();
    // console.log("the question: " + ques);
    // console.log("the number: " + num);
    await deleteDoc(doc(db, "questions", id));
    await updateList(id, num, ques);
    location.reload();
}

async function getQuestionFromLast(){
    const questionRef = collection(db, 'questions');
    const q = query(questionRef, orderBy("number", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    let ques;
    querySnapshot.forEach((doc) => {
        ques = doc.data().question;
    })

    // console.log("to reutnr : " + ques);
    return ques;
}

async function getNumberFromLast() {
    const questionRef = collection(db, 'questions');
    const q = query(questionRef, orderBy("number", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    let num;
    querySnapshot.forEach((doc) => {
        num = doc.data().number;
    })

    // console.log("to return : " + num);
    return num;
}


displayAllDocs();



form.addEventListener('submit', (e) =>{
    e.preventDefault();
    addDocument(); 
})


async function getDbCount() {
    const collectioz = collection(db, "questions");
    const snapshot = await getCountFromServer(collectioz);
    // console.log(snapshot.data().count);
    return snapshot.data().count;
}

async function getActualCount() {
    return getDbCount().then(x => {
        return x;
    })
}

async function addDocument(){
    // const docRef = await addDoc(collection(db, "questions"), {
    //     number: await findMissingNum(),
    //     question: form.question.value
    // });
    let docId = await findMissingNum();
    let stringId = docId.toString();
    await setDoc(doc(db, "questions", stringId), {
        number: docId,
        question: form.question.value
    });
    form.question.value = '';
    location.reload();
}



async function findMissingNum() {
    if (await getActualCount() === 0) {
        return 1;
    }
    //if found first missing number in between, return that missing number 
    //if the entire array has gone pass without finding missing number,
    //return 1 + array size 
    let arr = [];

    const questionRef = collection(db, 'questions');
    const q = query(questionRef, orderBy("number"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        arr.push(doc.data().number);
    })
    console.log(arr);
    
    for(let i = 1; i <= arr.length; i++){
        if(arr.indexOf(i) == -1) {
            return i;
        }
    }

    return await getActualCount() + 1;
}


async function updateList(id, numToDelete, ques){
    const numToUpdate = parseInt(id);
    const questionRef = collection(db, 'questions');
    const actualCount = await getActualCount();
    const missingNum = await findMissingNum();

    if (missingNum === (actualCount + 1)) {
        return; //nothing to update 
    }
    else {    
        const q = query(questionRef, orderBy("number", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        await setDoc(doc(db, "questions", id), {
            number: numToUpdate,
            question: ques
        });

        let docToDelete = numToDelete.toString();
        await deleteDoc(doc(db, "questions", docToDelete));
    }
}

