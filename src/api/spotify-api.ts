import { AuthData, refreshAccessToken } from '../main/auth';
import { SPOTIFY_API_URL as API_URL } from '../constants';

class SpotifyApi {
  private isThrottled: boolean;
  private throttleTime: number;
  private accessToken: string;
  private refreshToken: string;
  private errorMessage: string;

  get error(): string {
    return this.errorMessage;
  }

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
        this.errorMessage = `API calls throttled, wait ${Math.round(timeLeft / 1000)}s...`;
        console.warn(`${this.errorMessage} (${input})`);
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
        this.errorMessage = null;

        const responseLength = parseInt(res.headers.get('content-length'));
        return responseLength > 0 ? await res.json() : null;
      }
      case 204: {
        this.errorMessage = null;

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
    this.errorMessage = `${error.status}: ${error.message}`;
    console.error(this.errorMessage);

    return null;
  }
}

export const SpotifyApiInstance = new SpotifyApi();
