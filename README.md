## Intertwined
Intertwined is a proof-of-concept extension of Twine ([twinery.org](https://twinery.org)), an open-source tool for telling interactive, nonlinear stories created by Chris Klimas. Twine has had demonstrative success in the classroom as an educational tool, and Intertwined seeks to build upon that success by adding on the ability for multiple authors to collaborate on the same story in real-time across different computers.

~~You can test out Intertwined by going to [intertwinedapp.com](https://intertwinedapp.com). Please note that the web app is still in active development and data will be deleted from time to time.~~

I could not keep up with paying for the hosting of Intertwined on its own separate web page with how little interaction it was actually getting, so if you are actually interested in it, please either build and try it out yourself (instructions below) or reach out to me at ishiniwasaki@gmail.com and I will re-host it temporarily. 

Intertwined is not affiliated with Twine at all. Please send all correspondence regarding Intertwined to ishiniwasaki@gmail.com; please do not contact Chris or any of the people on the official Twine project, as they will have no idea what you are referring to.

### How it works (in a nutshell)

Twine saves stories and passages to a browser's local storage, making collaboration on a story a slightly cumbersome process. Intertwined rewires the internals of Twine and saves stories to a [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) instance so that the state of the story can be synchronized in real-time across different users. Passage texts are synchronized using [Firepad](https://firepad.io), an open-source collaborative code and text editor that not only uses the Firebase Real-Time Database as the enabler for it (which is great considering we are already using a Firebase service) but also works very well with Codemirror, the editing framework that Twine uses.

When building your own version of Intertwined for classroom use, it is advised to create your own free Firebase account so that your data can remain more secure (see the tutorial below).

### Why does this exist?

For a full discussion on the benefits of real-time collaborative work on learning, please read the full paper or watch the presentation for Intertwined: Enhancing K-12 Pair-Programming Engagement using Real-Time Collaboration with Twine (link TBD upon publication in SIGSCE 2023).

Interactive storytelling can be a useful educational tool for teaching students nuanced topics, such as mental health issues, cybersecurity, and research ethics. The ability to play through a story and choose different paths along the story and connecting the choices with the consequences of those choices benefit student learning. Students can not only be consumers of interactive stories, but creators of them. Creating nonlinear, interactive stories requires students to be able to synthesize the choices and those consequences, again leading to benefits in their learning.

As such, Twine has been used in education before, but having students collaborate on a story is difficult given the "stories are saved on the web browser" nature of Twine. People can collaborate on the content of the story on a separate application like Google Docs, but some of the most valuable parts of working in Twine - learning proper syntax, structuring the story, setting and using variables, editing CSS/Javascript, writing additional HTML - cannot be done concurrently.

Pair-programming (a style of collaboration where one person, the "driver", actually types on a computer while the "navigator" watches and directs over the shoulder) is a popular form of collaboration, but its success as a collaboration tool for professionals and older students do not translate as well for younger students that are still learning *how* to collaborate with others in an effective way. For those students, having individual computers in front of them and allowing for real-time collaboration is a more effective way of inviting meaningful, engaging collaboration.

Twine's destructured nature and its use of HTML/CSS/Javascript to create these stories nakes it a great candidate for teaching students the fundamentals of computer science with a real-time collaboration option. Real-time collaborative editors for coding is nothing novel, but those invite their own frustrations for students. Consider, for example, how an entire Java program can fail to compile even if one small part of its code base has a missing semincolon. Students collaborating on one program in real-time may find that their program breaks when another begins to edit it, and the structure for collaboration can become very rigid. With Twine/Intertwined, however, students can work on the same passage together and test individually without breaking each other's code (due to the more 'flexible' nature of HTML/CSS/JS), and errors in one passage will not affect another.

While Intertwined is far from perfect, it is my hope that this can demonstrate the effectiveness of real-time collaboration with a collaborative storytelling tool on student engagement. The ideal outcome of Intertwined is for someone that is way more knowledgeable on technologies like this to be inspired by it and make their own, better version of Intertwined so that many teachers and students can use it long-term. In the meantime, this is definitely usable by educators, and I encourage people to try it out at [intertwinedapp.com](https://intertwinedapp.com) and if they like it, build their own version and deploy it to use in their classroom long-term.

Finally, one final reason this exists is that Intertwined was a masters' thesis project for myself at Western Washington University, and this was a very interesting and meaningful project for me to undertake.

## How to build your own version of Intertwined

If you are interested in using Intertwined for your classroom or group long-term, it is advised to make your own build and deployent of Intertwined instead of using [intertwinedapp.com](https://intertwinedapp.com). Some reasons for building your own are:

- It saves me server costs on Intertwined
- As the 'official' Intertwined gets updated and changed, you won't be at risk of losing the data that's stored on those Firebase instances
- You are in control of your own Firebase instance, so all the data can be managed by you if you wish
- Improved security, since you are using your own Firebase instance

I have written and recorded in-depth, comprehensive guides below on how to set up, build, and deploy Intertwined for your own use below. The tutorial is written assuming zero experience on any web technology, and it is my hope that anyone and everyone who is interested in doing so will be able to set things up smoothly. The guides will take you from installing the required software to downloading the source code to setting it up on a hosting service that will give you a link (it won't be a fancy customized link, but it will get the job done) that your students can use to access it.

If you are an experienced user, there is a section below with limited instructions.

### Build-an-Intertwined Guide (for Windows)

The full guide (video coming soon!) for Windows users can be found in this Google Doc by clicking [here](https://docs.google.com/document/d/1_Hr7p6dKw3aDZh_qTMeqSWuDN38_eLwGCG2WpeIZt14/edit?usp=sharing).

### Build-an-Intertwined Guide (for Mac)

The full guide (video coming soon!) for Mac users can be found in this Google Doc by clicking [here](https://docs.google.com/document/d/1_mLqJVHI_T32qyCHFi0BRF7PxjlKxVGC0W2HHGNnbVw/edit?usp=sharing).

### Build-an-Intertwined (for experienced users)

Run `npm install` at the top level of the directory to install all of the node modules and such. I found that using the latest version of `npm` fails to install some things (this happened with original Twine as well). I used `node v. 16.19.0` and `npm v. 8.19.3` and found that they both work great, so I suggest using a tool like `nvm` to install those specific versions for yourself and use those.

You will need to set up some environment variables that has the Firebase information for your Firebase instance. Create a Firebase project that uses both Firestore and Realtime Database. Create a `.env` file in the base directory and fill it with the following info that's specific to your Firebase instance. The top two values (VERSION and NAME) can stay as they are:

```
REACT_APP_VERSION=$npm_package_version
REACT_APP_NAME=$npm_package_name
REACT_APP_FB_API_KEY= **Your Firebase API key**
REACT_APP_FB_AUTH_DOMAIN= **Your Firebase auth domain**
REACT_APP_FB_DATABASEURL= **Your Firebase database URL**
REACT_APP_FB_PROJECTID= **Your Firebase project ID**
REACT_APP_FB_STORAGEBUCKET= **Your Firebase storage bucket**
REACT_APP_FB_MESSAGESENDERID= **Your Firebase message sender ID**
REACT_APP_FB_APPID=**Your Firebase app ID**
REACT_APP_FB_MEASUREMENTID=**Your Firebase measurement ID**
```

Just like Twine, run `npm start` to begin serving a development version of Intertwined locally. This server will automatically update with changes you make.

You can build for deployment and release by running `npm run build:web`. You can do `npm run build` like the original Twine has, but I kind of ignored the Electron build entirely and focused solely on the web build, so if you try the Electron part I have literally no idea what will happen.Finished files will be found under `dist/web`.

`npm test` will test the source code respectively.

`npm run clean` will delete existing files in `electron-build/` and `dist/`.

### Building/Deployment Issues
If you have any issues with building or deployment, please contact me at ishiniwasaki@gmail.com. I can't guarantee I will be able to help with every problem, but I will do my best! 

#
## Original Twine Information (Abbreviated)

Intertwined would not exist, obviously, without the amazing work done by the official Twine team. Please consider supporting them and all the work that they do!

### twinejs

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas Michael
Edwards, Micah Fitch, Juhana Leinonen, Michael Savich, and Ross Smith

### SYNOPSIS

This is a port of Twine to a browser and Electron app. See
[twinery.org](https://twinery.org) for more info.

The story formats in minified format under `story-formats/` exist in separate
repositories:

-   [Harlowe](https://bitbucket.org/_L_/harlowe)
-   [Paperthin](https://github.com/klembot/paperthin)
-   [Snowman](https://github.com/klembot/snowman)
-   [SugarCube](https://bitbucket.org/tmedwards/sugarcube)

More details about Twine specifically can be found in the [twinejs repository](https://github.com/klembot/twinejs).
