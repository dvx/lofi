import * as React from 'react';
import './style.scss';

class Settings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
      return(
        <div className="settings-wnd">
          <form className="form-horizontal">
          <fieldset>

          <legend>Shuffle Settings</legend>

          <div className="form-group">
          <label className="control-label">Duplicates</label>
          <div>
              <input type="checkbox" name="repeat" id="repeat"/> <label htmlFor="repeat">Allow playing the same song in a row</label>
          </div>
          <label className="control-label">Song priority</label>
              <div>

                <select className="priority-picker">
                  <option value="random">Totally random</option>
                  <option value="fav">Play favorites more often</option>
                  <option value="nofav">Play favorites less often</option>
                </select>
              </div>
          </div>

          </fieldset>
          <fieldset>

          <legend>Spotify</legend>

          <div className="form-group">
          <div>
              <button>Log out</button>
          </div>
          </div>

          </fieldset>
          </form>
        </div>
      )
  }
}

export default Settings;
