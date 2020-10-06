import React from 'react';
import TitleBar from 'frameless-titlebar';
import * as j from '../../../../../package.json';
import './style.scss';

class About extends React.Component<any, any> {
  render() {
    return (
      <div className="about-wnd">
        <TitleBar
          disableMaximize
          disableMinimize
          currentWindow={window} // electron window instance
          onMaximize={() => {}}
          onMinimize={() => {}}
          onDoubleClick={() => {}}
          theme={{
            bar: {
              background: '#0000',
              borderBottom: '#0000',
            },
          }}
          onClose={() => this.props.lofi.hideAboutWindow()}
        />
        <div className="about-wrapper">
          <div style={{ textAlign: 'center' }}>
            <h1>Lofi v{j.version}</h1>
            <div>🎵🔉 A mini Spotify player with WebGL visualizations.</div>
          </div>
          <br />
          <br />
          <code>
            Copyright (c) 2019-2020 David Titarenco
            <br />
            <br />
            Permission is hereby granted, free of charge, to any person
            obtaining a copy of this software and associated documentation files
            (the "Software"), to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge,
            publish, distribute, sublicense, and/or sell copies of the Software,
            and to permit persons to whom the Software is furnished to do so,
            subject to the following conditions:
            <br />
            <br />
            The above copyright notice and this permission notice shall be
            included in all copies or substantial portions of the Software.
            <br />
            <br />
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </code>
        </div>
      </div>
    );
  }
}

export default About;
