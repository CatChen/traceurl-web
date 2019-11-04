import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Analytics from './Analytics';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'typeface-roboto';

ReactDOM.render(<App />, document.getElementById('root'));

window.addEventListener('beforeinstallprompt', async (event) => {
  const choiceResult = await event.userChoice();
  Analytics.logEvent('app', 'prompt', choiceResult.outcome);
});

window.addEventListener('appinstalled', (event) => {
  Analytics.logEvent('app', 'install', null, 1);
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
