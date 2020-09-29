import { AuthData, refreshAccessToken } from '../main/auth';

const API_URL = 'https://api.spotify.com/v1';

class SpotifyApi {
  private isThrottled: boolean;
  private throttleTime: number;
  private accessToken: string;
  private refreshToken: string;

  updateTokens(data: AuthData) {
    this.accessToken = data?.access_token;
    this.refreshToken = data?.refresh_token;
  }

  async fetch(input: RequestInfo, init?: RequestInit) {
    if (!this.accessToken) {
      console.warn(`Access token not set, ignoring fetch '${input}'`);
      return;
    }

    if (this.isThrottled) {
      const timeLeft = this.throttleTime - new Date().getTime();
      if (timeLeft > 0) {
        console.warn(
          `Spotify API call ignored, waiting ${timeLeft}ms... (${input})`
        );
        return null;
      } else {
        this.isThrottled = false;
      }
    }

    const initWithBearer = {
      ...init,
      headers: new Headers({
        Authorization: 'Bearer ' + this.accessToken,
      }),
    };

    const res = await fetch(API_URL + input, initWithBearer);
    switch (res.status) {
      case 200: {
        return await res.json();
      }
      case 204: {
        return null;
      }
      case 401: {
        if (this.refreshToken) {
          await refreshAccessToken(this.refreshToken);
        }
      }
      case 429: {
        const retryAfter = parseInt(res.headers.get('retry-after')) + 1;
        if (retryAfter) {
          this.throttleTime = new Date().getTime() + retryAfter * 1000;
          this.isThrottled = true;
        }
        break;
      }
    }

    const { error } = await res.json();

    // Normally the api would throw an error but given the limited scope of this api,
    // we'll just output the error to the console and return null.
    console.error(`${error.status}: ${error.message}`);

    return null;
  }
}

export const SpotifyApiInstance = new SpotifyApi();
