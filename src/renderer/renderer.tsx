import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import './style.scss';

import Lofi from './components/Lofi'

ReactDOM.render( <Lofi />, document.getElementById('app') );