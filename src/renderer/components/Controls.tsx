import * as React from 'react';

class Controls extends React.Component<any, any> {
  constructor(props: any){
    super(props);
  }

  render() {
    return(
        <div className='controls'>
            <div className='menu-item'><a className='button'><i className='fa fa-camera-retro'></i></a></div>
            <div className='menu-item'><a className='button'>Visualize</a></div>
        </div>
    );
  }
}

export default Controls;
