import * as React from 'react';
import './style.scss';

class Waiting extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="centered waiting">
        <p>
          <i className="fab fa-spotify"></i>
        </p>
      </div>
    );
  }
}

export default Waiting;
