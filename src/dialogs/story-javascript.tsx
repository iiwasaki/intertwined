import * as React from 'react';
import { debounce } from 'lodash';
import {useTranslation} from 'react-i18next';
import {IndentButtons, UndoRedoButtons} from '../components/codemirror';
import {ButtonBar} from '../components/container/button-bar';
import {DialogCard, DialogEditor} from '../components/container/dialog-card';
import {CodeArea} from '../components/control/code-area';
import {usePrefsContext} from '../store/prefs';
import {storyWithId, updateStory, useStoriesContext} from '../store/stories';
import {codeMirrorOptionsFromPrefs} from '../util/codemirror-options';
import {DialogComponentProps} from './dialogs.types';
import './story-javascript.css';

export interface StoryJavaScriptDialogProps extends DialogComponentProps {
	storyId: string;
}

export const StoryJavaScriptDialog: React.FC<StoryJavaScriptDialogProps> = props => {
	const {storyId, ...other} = props;
	const [cmEditor, setCmEditor] = React.useState<CodeMirror.Editor>();
	const {dispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const story = storyWithId(stories, storyId);
	const {t} = useTranslation();

	const [firePadInit, setFirePadInit] = React.useState(false);


	const debouncedOnChange = 
			debounce((value: string) => {
				dispatch(updateStory(stories, story, {script: value}, prefs.groupName, prefs.groupCode));
			}, 2000)

	const handleChange = React.useCallback(
		(
			editor: CodeMirror.Editor,
			data: CodeMirror.EditorChange,
			text: string
		) => {
		if (firePadInit){
			setCmEditor(editor);
			debouncedOnChange(text);
		}
	}, [firePadInit, debouncedOnChange]
	);

	return (
		<DialogCard
			{...other}
			className="story-javascript-dialog"
			headerLabel={t('dialogs.storyJavaScript.title')}
			maximizable
		>
			<ButtonBar>
				<UndoRedoButtons editor={cmEditor} watch={story.script} />
				<IndentButtons editor={cmEditor} />
			</ButtonBar>
			<DialogEditor>
				<CodeArea
					editorDidMount={setCmEditor}
					fontFamily={prefs.codeEditorFontFamily}
					fontScale={prefs.codeEditorFontScale}
					label={t('dialogs.storyJavaScript.editorLabel')}
					labelHidden
					onChange={handleChange}
					options={{
						...codeMirrorOptionsFromPrefs(prefs),
						autofocus: true,
						lineWrapping: true,
						mode: 'javascript',
						placeholder: t('dialogs.storyJavaScript.explanation')
					}}
					value={story.script}
					setFirePadInit={setFirePadInit}
					storyId={story.id}
					element={"javascript"}
				/>
			</DialogEditor>
		</DialogCard>
	);
};
