import * as React from 'react';
import './style.scss';

class Controls extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='controls centered'>
        <p>
        <a className='control-btn secondary-control not-draggable' href="#pp"><i className="fa fa-step-backward not-draggable"></i></a>
        <a className='control-btn not-draggable' href="#pp"><i className="fa fa-play not-draggable"></i></a>
        <a className='control-btn secondary-control not-draggable' href="#pp"><i className="fa fa-step-forward not-draggable"></i></a>
        </p>
      </div>
    );
  }
}

export default Controls;
