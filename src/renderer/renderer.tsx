import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import './style.scss';

import Cover from './components/Cover';
import Controls from './components/Controls';

ReactDOM.render(
    <Cover art='https://i.scdn.co/image/07c323340e03e25a8e5dd5b9a8ec72b69c50089d' />,
  document.getElementById('app')
);