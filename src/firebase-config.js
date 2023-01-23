/* Config files for Firebase.
 * This will not be visible in Github... I hope. */

/* Firebase imports */
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/database"

const fb_configs = {
    apiKey: "AIzaSyAlGCG-47VvTtVndtm3hmvkUhgcKkXk50s",
    authDomain: "intertwined-test-53c6b.firebaseapp.com",
    databaseURL: "https://intertwined-test-53c6b-default-rtdb.firebaseio.com",
    projectId: "intertwined-test-53c6b",
    storageBucket: "intertwined-test-53c6b.appspot.com",
    messagingSenderId: "664365222512",
    appId: "1:664365222512:web:daca8db8328a61a3c7c2b5",
    measurementId: "G-61FPX2TYRC"
}

console.log(process.env.REACT_APP_FB_API_KEY)

if (!firebase.apps.length) {
    console.log("Connecting to firebase...")
    firebase.initializeApp(fb_configs)
}

export const db = firebase.firestore()
export const rtdb = firebase.database()

