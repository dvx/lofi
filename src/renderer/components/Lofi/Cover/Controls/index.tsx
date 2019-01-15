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
        <a className='control-btn secondary-control' href="#pp"><i className="fa fa-step-backward"></i></a>
        <a className='control-btn' href="#pp"><i className="fa fa-play"></i></a>
        <a className='control-btn secondary-control' href="#pp"><i className="fa fa-step-forward"></i></a>
        </p>
      </div>
    );
  }
}

export default Controls;
