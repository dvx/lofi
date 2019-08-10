import * as React from 'react';
import './style.scss';

class Settings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
      return(
        <form className="form-horizontal settings-wnd">
        <fieldset>

        <legend>Shuffle settings</legend>

        <div className="form-group">
        <label className="control-label">Duplicates</label>
        <div>
            <input type="checkbox" name="vehicle1" value="Bike" /> Allow playing the same song in a row
        </div>
        <label className="control-label">Song priority</label>
            <div>
                <input type="radio" name="gender" value="male" /> Totally random<br/>
                <input type="radio" name="gender" value="female" /> Prioritize favorites<br/>
                <input type="radio" name="gender" value="other" /> Prioritize non-favorites<br/>  
            </div>
        </div>

        </fieldset>
        </form>
      )
  }
}

export default Settings;
