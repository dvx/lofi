import { refreshAccessToken } from '../main/auth';

const API_URL = 'https://api.spotify.com/v1';

class SpotifyApi {
  private isThrottled: boolean;
  private throttleTime: number;

  public refreshToken: string;

  async fetch(input: RequestInfo, init?: RequestInit) {
    if (this.isThrottled) {
      const timeLeft = this.throttleTime - new Date().getTime();
      if (timeLeft > 0) {
        console.warn(
          `Spotify API call ignored, waiting ${timeLeft}ms... (${input})`
        );
        return;
      } else {
        this.isThrottled = false;
      }
    }

    const res = await fetch(API_URL + input, init);
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
    console.error(`${error.status}: ${error.message}`);

    return null;
  }
}

export const SpotifyApiInstance = new SpotifyApi();
