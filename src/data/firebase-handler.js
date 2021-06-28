/* Base file for allowing use of Firebase throughout Twine for multi-user cases.
This should be imported by any file using Firebase (such as load/store stories) */

import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/firestore";
import actions, { createStory } from "./actions/story";
import regeneratorRuntime from "regenerator-runtime";

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
export const db = firebase.firestore();
const storyCollection = db.collection("stories");

export default class {

    /* Tests to make sure that whatever imported this class is actually able to use this */
    static testFB() {
        console.log("Testing....");
    }

    // Saves an entire story object; could grow to be pretty huge if the story gets big.
    // Should think about deconstructing story to be story + references to passages
    static saveStory(story){
        storyCollection.doc(story.id).set(story).then(() => {
            console.log("Story successfully saved.");
        })
        .catch((error) => {
            console.error("Error saving story: ", error);
        });
    }

    // Delete an entire story object.
    static deleteStory(storyId){
        storyCollection.doc(storyId).delete().then(() => {
            console.log("Story successfully deleted.");
        })
        .catch((error) => {
            console.error("Error deleting story: ", error);
        });
    }

    // Load all of the stories stored in the stories collection
    static loadStories(store){
        storyCollection.get().then((doc) => {
            doc.forEach((result) => {
                var loadedStory = result.data();
                /* Coerce the lastUpdate property to a date. */
		 		if (loadedStory.lastUpdate) {
		 			loadedStory.lastUpdate = loadedStory.lastUpdate.toDate();
		 		}
                 else {
                    loadedStory.lastUpdate = new Date();
                 }
                store.commit("ADD_STORY_TO_LIST", loadedStory);
            });
        }).catch((error) => {
            console.error("Error getting document: ", error);
        });
    }

    // Grab and return a singular story based off of ID
    static async loadStoryById(id) {
        try {
            const query = await storyCollection.doc(id).get().then((result) => {
                return result.data();
            });
            return query;
        }
        catch (error){
            console.error("Error loading story: ", error);
        }
    }

    static listenToStory(id){
        storyCollection.doc(id).onSnapshot((result) => {
            console.log("Current story: ", result.data());
            return result.data();
        });
    }
}