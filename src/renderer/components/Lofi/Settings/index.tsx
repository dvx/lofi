import * as React from 'react';
import * as settings from 'electron-settings';
import { remote } from 'electron'
import './style.scss';

class Settings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  nukeSpotifySettings() {
    settings.deleteAll();
    remote.app.relaunch();
    remote.app.exit(0);
  }

  render() {
      return(
        <div className="settings-wnd">
          <form className="form-horizontal">
          <fieldset>

          <legend>Lofi</legend>

          <div className="form-group">
          <label className="control-label">Window</label>
          <div>
              <input type="checkbox" name="pos" id="pos"/> <label htmlFor="pos">Remember Lofi window position</label>
          </div>
          </div>
          </fieldset>

          <fieldset>

          <legend>Shuffle</legend>

          <div className="form-group">
          <label className="control-label">Behavior</label>
          <div>
              <input type="checkbox" name="repeat" id="repeat"/> <label htmlFor="repeat">Avoid playing the same song in a row</label><br/>
              <input type="checkbox" name="similar" id="similar"/> <label htmlFor="similar">Avoid playing similar songs in a row</label>
          </div>
          <label className="control-label">Favorites</label>
              <div>

                <select className="picker">
                  <option value="random">Totally random</option>
                  <option value="fav">Play favorites more often</option>
                  <option value="nofav">Play favorites less often</option>
                </select>
              </div>
              <label className="control-label">Popularity</label>
              <div>

                <select className="picker">
                  <option value="random">Totally random</option>
                  <option value="fav">Play popular songs more often</option>
                  <option value="nofav">Play popular songs less often</option>
                </select>
              </div>
          </div>

          </fieldset>
          <fieldset>

          <legend>Reset</legend>

          <div className="form-group">
          <div>
            <a href="#" onClick={this.nukeSpotifySettings.bind(this)} className="red-button">Reset to factory defaults</a>
          </div>
          </div>

          </fieldset>
          </form>
        </div>
      )
  }
}

export default Settings;