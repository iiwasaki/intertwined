import { Component } from "react"
import "firebase/database"
import {
    UnControlled as CodeMirrorItem,
} from 'react-codemirror2';
import CodeMirror from "codemirror/lib/codemirror.js"
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import { rtdb } from "../../../firebase-config";

window.CodeMirror = CodeMirror

class FirepadMirror extends Component {

    constructor(props) {
        super(props)
        this.editorInstance = null
        this.firepad = null

    }
    componentDidMount() {
        // Connect to the Firebase RTDB reference for this Firepad instance
        let firebase_node = this.props.storyId + "_public"
        let rt_text = rtdb.ref().child("texts").child(firebase_node).child(this.props.element)

        const Firepad = require("firepad")
        this.firepad = new Firepad.fromCodeMirror(rt_text, this.editorInstance, { defaultText: this.props.options.placeholder })
        this.firepad.on('ready', () => {
            // if (firepad.isHistoryEmpty()) {
            //     firepad.setText('Placeholder text')
            // }
            console.log("Firepad ready: ", this.props)
            this.props.setFirePadInit(true)
        })
    }

    componentWillUnmount() {
        console.log("Unmounting")
        console.log(this.firepad)
        this.firepad.dispose()
    }

    render() {

        return (
            <CodeMirrorItem {...this.props} editorDidMount={editor => {
                this.editorInstance = editor
                setTimeout(() => {
                    console.log("Actually handling mount")
                    this.editorInstance.focus();
                    this.editorInstance.refresh();
                }, 500)
            }} />
        )
    }
}

export default FirepadMirror