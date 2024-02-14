import { ipcRenderer, ipcMain } from 'electron';

// eslint-disable-next-line camelcase
const sp_dc =
  'AQDkOH45Eb7QlEgTLWDjlP9YTbK8p0kJD02mr2vq8gtISw7v-YMDcRgBBW0nCpaJeg0rSeic_-Q0hCvwf_RtbBLV7E3yN64wQueDcyvXrvdSlk3TZF-Vl1UuZG1LBYp0rG4wbT1xUNL-sSZmbsCl6KhzoucvvLGX';

const token =
  'BQBISYKmgH9KBYhLFEOop-QvkS0eB141iHePtS91dqCDxvIt9r_oOTk3pGWR5vIlyS9oMOK6h1EmX1ANS0XftaTGRYResMuZnb3EC2oGNjCCxAtg92jSAAPggBBjCLUnirmX6E6yZC8HtwxpE2PHBPp9oFx63pbBBU7t9Ij7BYbDd26jwSzD0gTPBlwTrImKQBCM2r2R8g0bnRwMTUhKew2HU4OqC38aIybThYyn8ZquDikuXtqLlgbhn2ht6AHRqB_Wo657J61EuDM6umkcF2ceEowFOvTG0MK8YlL9U_6iWONn8WU-XUTr7OEfC68gOI9Hv0fNtJQBKsNavMuERNMN';

const TOKEN_URL = 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player';
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Safari/537.36';

export interface Line {
  startTimeMs: string;
  words: string;
  syllables: [];
  endTimeMs: string;
}
export interface LyricsData {
  lyrics: {
    syncType: string;
    lines: {
      startTimeMs: string;
      words: string;
      syllables: [];
      endTimeMs: string;
    }[];
    provider: string;
    providerLyricsId: string;
    providerDisplayName: string;
    syncLyricsUri: string;
    isDenseTypeface: boolean;
    alternatives: [];
    language: string;
    isRtlLanguage: boolean;
    fullscreenAction: string;
    showUpsell: boolean;
    capStatus: string;
    impressionsRemaining: number;
  };
  colors: {
    background: number;
    text: number;
    highlightText: number;
  };
  hasVocalRemoval: boolean;
}

class SpotifyLyricsAPI {
  private token: string;

  loggedIn: boolean;

  constructor(private dcToken: string) {
    this.loggedIn = false;
    this.login().then((r) => {
      this.loggedIn = r;
    });
    this.token = token;
    // this.loggedIn = true;
  }

  async login(): Promise<boolean> {
    try {
      // Set the cookie
      ipcRenderer.send('set-cookie', 'https://spotify.com/', 'sp_dc', this.dcToken);

      // Make the request with fetch
      const response = await fetch(TOKEN_URL, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'User-Agent': USER_AGENT,
          'app-platform': 'WebPlayer',
        },
        redirect: 'manual',
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      // Parse the response body as JSON
      const data = await response.json();

      // Store the access token
      this.token = data.accessToken;

      return true;
    } catch (error) {
      console.error(error);
      throw new Error('sp_dc provided is invalid, please check it again!');
    }
  }

  async getLyrics(trackId: string): Promise<LyricsData> {
    console.log(this.loggedIn, trackId);
    if (!this.loggedIn || trackId === '') {
      return null;
    }
    try {
      const response = await fetch(
        `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&market=from_token`,
        {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'User-Agent': USER_AGENT,
            'app-platform': 'WebPlayer',
            authorization: `Bearer ${this.token}`,
          },
          redirect: 'manual',
        }
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      // Parse the response body as JSON
      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const SpotifyLyricsApiInstance = new SpotifyLyricsAPI(sp_dc);
