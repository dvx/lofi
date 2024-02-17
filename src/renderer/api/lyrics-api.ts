/* eslint-disable no-console */

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

  constructor() {
    this.login()
      .then()
      .catch(() => {
        this.token = '';
      });
  }

  async login(): Promise<boolean> {
    this.token = '';
    try {
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
        console.error(`Request failed: ${response.status}`);
        return false;
      }

      // Parse the response body as JSON
      const data = await response.json();

      // Store the access token
      this.token = data.accessToken;

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getLyrics(trackId: string): Promise<LyricsData> {
    if (this.token === '' || trackId === '') {
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

export const SpotifyLyricsApiInstance = new SpotifyLyricsAPI();
