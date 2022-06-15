/* Base file for allowing use of Firebase throughout Twine for multi-user cases.
This should be imported by any file using Firebase (such as load/store stories) */

import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/firestore";
import "firebase/database";
import "firebase/auth";
import actions, { createStory } from "./actions/story";
import regeneratorRuntime from "regenerator-runtime";
import store from '../data/store';

// Config file unique to this app that points to the Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyCuEgC7txr-xCnc54TKn3vG63QMhD4sonw",
    authDomain: "intertwined-73a5b.firebaseapp.com",
    databaseURL: "https://intertwined-73a5b-default-rtdb.firebaseio.com",
    projectId: "intertwined-73a5b",
    storageBucket: "intertwined-73a5b.appspot.com",
    messagingSenderId: "299315239520",
    appId: "1:299315239520:web:31c32ba60b829ade76c105",
    measurementId: "G-DTZZ9216C8"
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const storyCollection = db.collection("stories");
export const groupCollection = db.collection("groups");
export const firepadRef = firebase.database().ref();

export default class {

    /* Tests to make sure that whatever imported this class is actually able to use this */
    static testFB() {
        console.log("Testing....");
    }

    // Saves an entire story object; could grow to be pretty huge if the story gets big.
    // Should think about deconstructing story to be story + references to passages
    static saveStory(story) {
        console.log("in savestory firebase handler");
        groupCollection.doc(story.groupName).collection('stories').doc(story.id).set(story).then(() => {
            console.log("Story successfully saved.");
        })
            .catch((error) => {
                console.error("Error saving story: ", error);
            });
    }

    // Delete an entire story object.
    static deleteStory(groupName, storyId) {
        console.log("in delete story firebase handler");
        groupCollection.doc(groupName).collection('stories').doc(storyId).delete().then(() => {
            console.log("Story successfully deleted.");
        })
            .catch((error) => {
                console.error("Error deleting story: ", error);
            });
    }

    //Load all of the stories stored in the stories collection
    static loadStories(store, groupName) {
        console.log("in load story firebase handler");
        groupCollection.doc(groupName).collection('stories').get().then((doc) => {
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
    static async loadStoryById(groupName, id) {
        console.log("in load story by ID firebase handler");
        try {
            const query = await groupCollection.doc(groupName).collection('stories').doc(id).get().then((result) => {
                return result.data();
            });
            return query;
        }
        catch (error) {
            console.error("Error loading story: ", error);
        }
    }

    /* Unused now, but leaving it in for now - no authentication is needed since it doesn't work
     * well with security rules with just an anonymous auth */
    static async anonymousAuth() {
        console.log("Logging in anonymously - this should not appear in console ever");
        try {
            const login = await firebase.auth().signInAnonymously();
            console.log("Login:");
            console.log(login);
        }
        catch (err) {
            console.log(err.code);
            console.log(err.message);
        }
    }

    static updateGroup(name, pass, order, dir){
        store.commit("UPDATE_PREF", {name: 'group', value: name});
        store.commit("UPDATE_PREF", {name: 'groupcode', value: pass});
        store.dispatch('bindStories', {order: order, dir: dir, groupID: name});
    }
}