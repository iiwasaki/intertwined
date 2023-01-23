/* Config files for Firebase.
 * This will not be visible in Github... I hope. */

/* Firebase imports */
import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/database"

/* If you are setting up your own, replace these with the configurations for your particular setup! */

const fb_configs = {
    apiKey: process.env.REACT_APP_FB_API_KEY,
    authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FB_DATABASEURL,
    projectId: process.env.REACT_APP_FB_PROJECTID,
    storageBucket: process.env.REACT_APP_FB_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_FB_MESSAGESENDERID,
    appId: process.env.REACT_APP_FB_APPID,
    measurementId: process.env.REACT_APP_FB_MEASUREMENTID,
}

if (!firebase.apps.length) {
    console.log("Connecting to firebase...")
    firebase.initializeApp(fb_configs)
}

export const db = firebase.firestore()
export const rtdb = firebase.database()

