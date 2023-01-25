import {IconDeviceFloppy, IconHelp, IconMoodSmile} from '@tabler/icons';
//import {IconTwine} from '../../components/image/icon';
import {isElectronRenderer} from '../../util/is-electron';
import { IntertwinedIcon } from '../../components/image/icon';

export const content = () => [
	{
		html: 'routes.welcome.interGreeting',
		image: <IntertwinedIcon/>,
		nextLabel: 'routes.welcome.tellMeMore',
		title: 'routes.welcome.interTitle'
	},
	{
		html: 'routes.welcome.interHelp',
		image: <IconHelp />,
		title: 'routes.welcome.interHelpTitle'
	},
	isElectronRenderer()
		? {
				html: 'routes.welcome.autosave',
				image: <IconDeviceFloppy />,
				title: 'routes.welcome.autosaveTitle'
		  }
		: {
				html: 'routes.welcome.interStorage',
				image: <IconDeviceFloppy />,
				title: 'routes.welcome.interStorageTitle'
		  },
	{
		html: 'routes.welcome.interWelcomeDone',
		image: <IconMoodSmile />,
		nextLabel: 'routes.welcome.gotoStoryList',
		title: 'routes.welcome.doneTitle'
	}
];
