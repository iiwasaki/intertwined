/* Base file for allowing use of Firebase throughout Twine for multi-user cases.
This should be imported by any file using Firebase (such as load/store stories) */

import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/firestore";
import actions, { createStory } from "./actions/story";

// Config file unique to this app that points to the Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyCuEgC7txr-xCnc54TKn3vG63QMhD4sonw",
    authDomain: "intertwined-73a5b.firebaseapp.com",
    projectId: "intertwined-73a5b",
    storageBucket: "intertwined-73a5b.appspot.com",
    messagingSenderId: "299315239520",
    appId: "1:299315239520:web:31c32ba60b829ade76c105",
    measurementId: "G-DTZZ9216C8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

export default class {

    /* Tests to make sure that whatever imported this class is actually able to use this */
    static testFB() {
        console.log("Testing....");
    }

    // Saves an entire story object; could grow to be pretty huge if the story gets big.
    // Should think about deconstructing story to be story + references to passages
    static saveStory(story){
        db.collection("stories").doc(story.id).set(story).then(() => {
            console.log("Story successfully saved.");
        })
        .catch((error) => {
            console.error("Error saving story: ", error);
        });
    }

    // Delete an entire story object.
    static deleteStory(story){
        db.collection("stories").doc(story.id).delete().then(() => {
            console.log("Story successfully deleted.");
        })
        .catch((error) => {
            console.error("Error deleting story: ", error);
        });
    }

    // Load all of the stories stored in the stories collection
    static loadStories(store){
        let stories = {};
        db.collection("stories").get().then((doc) => {
            doc.forEach((result) => {
                var loadedStory = result.data();
                console.log("Date, ", loadedStory.lastUpdate);
                /* Coerce the lastUpdate property to a date. */
		 		if (loadedStory.lastUpdate) {
		 			loadedStory.lastUpdate = loadedStory.lastUpdate.toDate();
		 		}
                 else {
                    loadedStory.lastUpdate = new Date();
                 }
                stories[loadedStory.id] = loadedStory;
                createStory(store, loadedStory);
            });
        }).catch((error) => {
            console.error("Error getting document: ", error);
        });
    }
}