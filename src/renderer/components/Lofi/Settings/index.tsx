import React, { useState } from 'react';
import * as settings from 'electron-settings';
import { remote } from 'electron'
import TitleBar from 'frameless-titlebar'
import './style.scss';

import { visualizations } from '../../../../visualizations/visualizations.js';
import { MACOS } from '../../../../constants';

class Settings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      ...settings.getSync()
    }
  }

  nukeSettings() {
    if (confirm("Are you sure you want to reset all Lofi settings?")) {
      settings.resetToDefaults();
      remote.app.relaunch();
      remote.app.exit(0);
    }
  }

  commitSettings() {
    // Commit window settings
    settings.setSync('lofi.window.always_on_top', this.state.lofi.window.always_on_top)
    settings.setSync('lofi.window.remember', this.state.lofi.window.remember)
    settings.setSync('lofi.window.hide', this.state.lofi.window.hide)
    settings.setSync('lofi.window.metadata', this.state.lofi.window.metadata)

    // Commit visualization settings
    settings.setSync('lofi.visualization', this.state.lofi.visualization)

    // Commit advanced settings
    settings.setSync('hardware_acceleration', this.state.hardware_acceleration)
    settings.setSync('debug', this.state.debug)

    // Hide settings window and reload settings in main process
    this.props.lofi.hideSettingsWindow();
    this.props.lofi.reloadSettings();
  }

  // Don't do this at home
  changeLofiCheckboxSettings(parent: string, child: string) {
    if (parent && child) {
      this.setState((prevState: { [x: string]: any; }) => {
        const lofi = {...prevState['lofi']};
        lofi[parent][child] = !lofi[parent][child];
        return { lofi }
      })
    } else if (!parent && child) {
      const settings: { [x: string]: any; } = this.state;
      settings[child] = !settings[child];
      this.setState(settings);
    }
  }

  changeLofiVisualizationSettings( event: { target: HTMLSelectElement } ) {
    const settings: { [x: string]: any; } = this.state;
    settings.lofi.visualization = Number(event.target.value);
    this.setState(settings);
  }

  render() {
      return(
        <div className="settings-wnd">
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
              borderBottom: '#0000'
            }
          }}
          onClose={() => this.props.lofi.hideSettingsWindow()}
          />
          <div className="settings-wrapper">
            <form className="form-horizontal">
            <fieldset>

            <legend>Window</legend>

            <div className="form-group">
              <div>
                  <input type="checkbox" name="always_on_top" id="always_on_top" onChange={this.changeLofiCheckboxSettings.bind(this, 'window', 'always_on_top')} checked={this.state.lofi.window.always_on_top}/> <label htmlFor="always_on_top">Show Lofi window always on top (requires restart)</label>
              </div>
              <div>
                  <input type="checkbox" name="pos" id="pos" onChange={this.changeLofiCheckboxSettings.bind(this, 'window', 'remember')} checked={this.state.lofi.window.remember}/> <label htmlFor="pos">Remember Lofi window position</label>
              </div>
              <div>
                  <input type="checkbox" name="hide" id="hide" onChange={this.changeLofiCheckboxSettings.bind(this, 'window', 'hide')} checked={this.state.lofi.window.hide}/> <label htmlFor="hide">Hide Lofi window if Spotify is not detected</label>
              </div>
              <div>
                  <input type="checkbox" name="metadata" id="metadata" onChange={this.changeLofiCheckboxSettings.bind(this, 'window', 'metadata')} checked={this.state.lofi.window.metadata}/> <label htmlFor="metadata">Always show song and artist metadata</label>
              </div>
            </div>
            </fieldset>
            <fieldset>

            <legend>Visualization</legend>

            <div className="form-group">
              <div>
                <select disabled = { MACOS } value={this.state.lofi.visualization} className="picker" onChange={this.changeLofiVisualizationSettings.bind(this)}>
                  {visualizations.map((vis, idx) =>
                    <option key={idx} value={idx}>{vis.name}</option>
                  )};
                </select>
              </div>
            </div>
            </fieldset>

            <fieldset>

            <legend>Advanced</legend>

            <div className="form-group">
              <div>
                  <input type="checkbox" name="hardware_acceleration" id="hardware_acceleration" onChange={this.changeLofiCheckboxSettings.bind(this, null, 'hardware_acceleration')} checked={this.state.hardware_acceleration}/> <label htmlFor="hardware_acceleration">Video card hardware acceleration (requires restart)</label>
              </div>
              <div>
                  <input type="checkbox" name="debug" id="debug" onChange={this.changeLofiCheckboxSettings.bind(this, null, 'debug')} checked={this.state.debug}/> <label htmlFor="debug">Debug mode (requires restart)</label>
              </div>
            </div>
            </fieldset>
            </form>
            <div className="button-container">
              <div className="red-holder"><a href="#" onClick={this.nukeSettings} className="red-button">Reset to factory defaults</a></div>
              <div className="green-holder"><a href="#" onClick={this.commitSettings.bind(this)} className="green-button">Save settings</a></div>
            </div>
          </div>
        </div>
      )
  }
}

export default Settings;
