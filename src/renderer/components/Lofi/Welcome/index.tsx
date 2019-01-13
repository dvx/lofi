import * as React from 'react';
import Menu from './../Menu';
import './style.scss';

class Welcome extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className='welcome full'>
        <Menu />
        <div className='centered'>
          <a target="_blank" href="http://auth.lofi.rocks/login"><i className="fa fa-spotify"></i>&nbsp;&nbsp;<strong>Log in</strong></a>
        </div>
      </div>
    );
  }
}

export default Welcome;
