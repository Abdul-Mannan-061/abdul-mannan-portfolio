import {createRoot, hydrateRoot} from 'react-dom/client';
import Portfolio from './portfolio';
import {initialData} from './content';
import './globals.css';

const container = document.getElementById('root');
if (!container) throw new Error('Portfolio root was not found.');
const app = <Portfolio initial={initialData}/>;
if (container.querySelector('.portfolio')) hydrateRoot(container, app);
else createRoot(container).render(app);
