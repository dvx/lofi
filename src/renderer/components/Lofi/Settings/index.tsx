import React from 'react';
import * as settings from 'electron-settings';
import TitleBar from 'frameless-titlebar';
import './style.scss';

import { visualizations } from '../../../../visualizations/visualizations.js';
import { MACOS, DEFAULT_SETTINGS } from '../../../../constants';
import { get, set } from 'lodash';
import { remote } from 'electron';

import { Platform } from 'frameless-titlebar/dist/title-bar/typings';

interface Setting {
  name: string;
  callback?: (value: any) => void;
}

class Settings extends React.Component<any, any> {
  private oldSettings: any;
  private settingsToWatch: Setting[];
  constructor(props: any) {
    super(props);
    this.state = {
      ...settings.getSync(),
    };

    this.oldSettings = {};
    this.settingsToWatch = this.initSettingsToWatch();
    this.settingsToWatch.map((setting) => {
      const currentSetting =
        get(this.state, setting.name) ?? get(DEFAULT_SETTINGS, setting.name);
      this.oldSettings[setting.name] = currentSetting;
    });
  }

  initSettingsToWatch() {
    const mainWindow = remote.getCurrentWindow();
    const settingsToWatch: Setting[] = [
      {
        name: 'lofi.window.always_on_top',
        callback: (value) => mainWindow.setAlwaysOnTop(value),
      },
      {
        name: 'lofi.window.show_in_taskbar',
        callback: (value) => {
          mainWindow.setSkipTaskbar(!value);
          mainWindow.setFocusable(value);

          // Workaround to make setSkipTaskbar behave
          // cf. https://github.com/electron/electron/issues/18378
          mainWindow.on('focus', () => {
            mainWindow.setSkipTaskbar(!value);
          });
        },
      },
      { name: 'lofi.window.hide' },
      { name: 'lofi.window.metadata' },
      { name: 'lofi.window.show_progress' },
      { name: 'lofi.window.bar_thickness' },
      { name: 'lofi.visualization' },
      { name: 'hardware_acceleration' },
      {
        name: 'debug',
        callback: (value) =>
          value
            ? mainWindow.webContents.openDevTools({ mode: 'detach' })
            : mainWindow.webContents.closeDevTools(),
      },
      { name: 'lofi.audio.volume_increment' },
    ];

    return settingsToWatch;
  }

  nukeSettings() {
    if (!confirm('Are you sure you want to reset all Lofi settings?')) {
      return;
    }

    this.settingsToWatch.map((setting) => {
      this.setNewSettingsState(
        setting.name,
        get(DEFAULT_SETTINGS, setting.name)
      );
      settings.setSync(setting.name, get(DEFAULT_SETTINGS, setting.name));
      if (setting.callback) {
        setting.callback(get(DEFAULT_SETTINGS, setting.name));
      }
    });

    this.props.lofi.hideSettingsWindow();
    this.props.lofi.reloadSettings();
  }

  commitSettings() {
    if (!this.isFormValid()) {
      return;
    }

    // Commit window settings
    settings.setSync(
      'lofi.window.always_on_top',
      this.state.lofi.window.always_on_top
    );
    settings.setSync(
      'lofi.window.show_in_taskbar',
      this.state.lofi.window.show_in_taskbar
    );
    settings.setSync('lofi.window.hide', this.state.lofi.window.hide);
    settings.setSync('lofi.window.metadata', this.state.lofi.window.metadata);
    settings.setSync('lofi.window.show_progress', this.state.lofi.window.show_progress);
    settings.setSync('lofi.window.bar_thickness', this.state.lofi.window.bar_thickness);

    // Commit visualization settings
    settings.setSync('lofi.visualization', this.state.lofi.visualization);

    // Commit advanced settings
    settings.setSync('hardware_acceleration', this.state.hardware_acceleration);
    settings.setSync('debug', this.state.debug);

    // Commit audio settings
    settings.setSync(
      'lofi.audio.volume_increment',
      this.state.lofi.audio.volume_increment
    );

    const changedSettings = this.getChangedSettings();
    changedSettings.map((setting) => {
      if (setting.callback) {
        setting.callback(get(this.state, setting.name));
      }
    });

    // Hide settings window and reload settings in main process
    this.props.lofi.hideSettingsWindow();
    this.props.lofi.reloadSettings();
  }

  setNewSettingsState(fullName: string, newValue: any) {
    const settings: { [x: string]: any } = this.state;
    set(settings, fullName, newValue);
    this.setState(settings);
  }

  getChangedSettings() {
    const currentSettings: { [x: string]: any } = this.state;
    const changedSettings = this.settingsToWatch.filter(
      (setting) =>
        this.oldSettings[setting.name] !== get(currentSettings, setting.name)
    );

    return changedSettings;
  }

  isFormValid() {
    const changedSettings = this.getChangedSettings();
    if (!changedSettings || changedSettings.length === 0) {
      return false;
    }

    return (
      this.state.lofi.audio.volume_increment &&
      this.state.lofi.audio.volume_increment > 0 &&
      this.state.lofi.audio.volume_increment <= 100 &&
      this.state.lofi.window.bar_thickness &&
      this.state.lofi.window.bar_thickness > 0 &&
      this.state.lofi.window.bar_thickness <= 20
    );
  }

  render() {
    return (
      <div className="settings-wnd">
        <TitleBar
          disableMaximize
          disableMinimize
          currentWindow={window} // electron window instance
          platform={(process.platform as Platform) ?? 'win32'}
          theme={{
            bar: {
              background: '#0000',
              borderBottom: '#0000',
            },
          }}
          onClose={() => this.props.lofi.hideSettingsWindow()}
        />
        <div className="settings-wrapper">
          <form className="form-horizontal">
            <fieldset>
              <legend>Window</legend>

              <div className="form-group">
                <div>
                  <input
                    type="checkbox"
                    name="always_on_top"
                    id="always_on_top"
                    onChange={() =>
                      this.setNewSettingsState(
                        'lofi.window.always_on_top',
                        !this.state.lofi.window.always_on_top
                      )
                    }
                    checked={this.state.lofi.window.always_on_top}
                  />
                  <label htmlFor="always_on_top">Always on top</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name=""
                    id="show_in_taskbar"
                    onChange={() =>
                      this.setNewSettingsState(
                        'lofi.window.show_in_taskbar',
                        !this.state.lofi.window.show_in_taskbar
                      )
                    }
                    checked={this.state.lofi.window.show_in_taskbar}
                  />
                  <label htmlFor="show_in_taskbar">
                    Display in the task bar
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="hide"
                    id="hide"
                    onChange={() =>
                      this.setNewSettingsState(
                        'lofi.window.hide',
                        !this.state.lofi.window.hide
                      )
                    }
                    checked={this.state.lofi.window.hide}
                  />
                  <label htmlFor="hide">
                    Hide when Spotify is not detected
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="metadata"
                    id="metadata"
                    onChange={() =>
                      this.setNewSettingsState(
                        'lofi.window.metadata',
                        !this.state.lofi.window.metadata
                      )
                    }
                    checked={this.state.lofi.window.metadata}
                  />
                  <label htmlFor="metadata">
                    Always show song and artist metadata
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="show_progress"
                    id="show_progress"
                    onChange={() =>
                      this.setNewSettingsState(
                        'lofi.window.show_progress',
                        !this.state.lofi.window.show_progress
                      )
                    }
                    checked={this.state.lofi.window.show_progress}
                  />
                  <label htmlFor="show_progress">
                    Always show song progress
                  </label>
                </div>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  max="20"
                  defaultValue="1"
                  name="bar_thickness"
                  id="bar_thickness"
                  onChange={(e) =>
                    this.setNewSettingsState(
                      'lofi.window.bar_thickness',
                      e.target.value
                    )
                  }
                  value={this.state.lofi.window.bar_thickness}
                />
                <label htmlFor="bar_thickness">
                  Thickness of the volume and song progress bar in pixels
                </label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Visualization</legend>

              <div className="form-group">
                <div>
                  <select
                    disabled={MACOS}
                    value={this.state.lofi.visualization}
                    className="picker"
                    onChange={(e) =>
                      this.setNewSettingsState(
                        'lofi.visualization',
                        Number(e.target.value)
                      )
                    }>
                    {visualizations.map((vis, idx) => (
                      <option key={idx} value={idx}>
                        {vis.name}
                      </option>
                    ))}
                    ;
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Audio</legend>

              <div className="form-group">
                <div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    name="volume_increment"
                    id="volume_increment"
                    onChange={(e) =>
                      this.setNewSettingsState(
                        'lofi.audio.volume_increment',
                        e.target.value
                      )
                    }
                    value={this.state.lofi.audio.volume_increment}
                  />
                  <label htmlFor="volume_increment">
                    Scroll wheel volume increment
                  </label>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Advanced</legend>

              <div className="form-group">
                <div>
                  <input
                    type="checkbox"
                    name="hardware_acceleration"
                    id="hardware_acceleration"
                    onChange={() =>
                      this.setNewSettingsState(
                        'hardware_acceleration',
                        !this.state.hardware_acceleration
                      )
                    }
                    checked={this.state.hardware_acceleration}
                  />
                  <label htmlFor="hardware_acceleration">
                    Use hardware acceleration (requires restart)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="debug"
                    id="debug"
                    onChange={(e) =>
                      this.setNewSettingsState('debug', !this.state.debug)
                    }
                    checked={this.state.debug}
                  />
                  <label htmlFor="debug">Debug mode</label>
                </div>
              </div>
            </fieldset>
          </form>
          <div className="button-container">
            <div className="button-holder">
              <a
                href="#"
                onClick={this.nukeSettings.bind(this)}
                className="red-button">
                Reset to defaults
              </a>
            </div>
            <div className="button-holder">
              <a
                href="#"
                onClick={this.commitSettings.bind(this)}
                className={`${this.isFormValid() ? 'green-button' : 'button-disabled'
                  }`}>
                Save
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;
