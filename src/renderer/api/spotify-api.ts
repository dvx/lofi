import { SPOTIFY_API_URL as API_URL } from '../../constants';
import { AuthData, refreshAccessToken } from '../../main/auth';

export enum AccountType {
  Free = 'free',
  Premium = 'premium',
}

interface SpotifyImage {
  url: string;
}

interface SpotifyAccount {
  id: string;
  product: string;
  email: string;
  display_name: string;
  images: SpotifyImage[];
}

export interface SpotifyUserProfile {
  id: string;
  product: string;
  email: string;
  name: string;
  avatar: string;
  accountType: AccountType;
}

export interface SpotifyCurrentlyPlaying {
  device: {
    volume_percent: number;
  };
  progress_ms: number;
  item: {
    album: {
      name: string;
      images: [
        {
          height: number;
          width: number;
          url: string;
        }
      ];
    };
    artists: [
      {
        name: string;
      }
    ];
    description: string;
    id: string;
    images: [
      {
        height: number;
        width: number;
        url: string;
      }
    ];
    duration_ms: number;
    name: string;
    type: string;
  };
  is_playing: boolean;
}

class SpotifyApi {
  private isThrottled: boolean;

  private throttleTime: number;

  private accessToken: string;

  private refreshToken: string;

  async updateTokens(data: AuthData): Promise<SpotifyUserProfile> {
    this.accessToken = data?.access_token;
    this.refreshToken = data?.refresh_token;

    if (!this.accessToken) {
      return null;
    }

    const userProfile = await this.fetch<SpotifyAccount>('/me', {
      method: 'GET',
    });

    return {
      ...userProfile,
      accountType: userProfile?.product as AccountType,
      name: userProfile?.display_name,
      avatar: userProfile?.images?.length > 0 ? userProfile?.images[0].url : '',
    };
  }

  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying> {
    return this.fetch<SpotifyCurrentlyPlaying>('/me/player?type=episode,track', {
      method: 'GET',
    });
  }

  async play(pause: boolean): Promise<void> {
    if (pause) {
      this.fetch('/me/player/pause', {
        method: 'PUT',
      });
    } else {
      await this.fetch('/me/player/play', {
        method: 'PUT',
      });
    }
  }

  async skip(isForward: boolean): Promise<void> {
    await this.fetch(`/me/player/${isForward ? 'next' : 'previous'}`, {
      method: 'POST',
    });
  }

  async like(isLiked: boolean, trackId: string): Promise<void> {
    const verb = isLiked ? 'DELETE' : 'PUT';
    await this.fetch(`/me/tracks?ids=${trackId}`, {
      method: verb,
    });
  }

  async isTrackLiked(trackId: string): Promise<boolean> {
    const likedResponse: Array<boolean> = await this.fetch(`/me/tracks/contains?ids=${trackId}`, {
      method: 'GET',
    });

    if (!likedResponse || likedResponse.length === 0) {
      return false;
    }
    return likedResponse[0];
  }

  async seek(newProgress: number): Promise<void> {
    await this.fetch(`/me/player/seek?position_ms=${newProgress}`, {
      method: 'PUT',
    });
  }

  async setVolume(newVolume: number): Promise<void> {
    await this.fetch(`/me/player/volume?volume_percent=${newVolume}`, {
      method: 'PUT',
    });
  }

  private async fetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    if (!this.accessToken) {
      return null;
    }

    if (this.isThrottled) {
      const timeLeft = this.throttleTime - new Date().getTime();
      if (timeLeft > 0) {
        throw new Error(`API calls throttled, wait ${Math.round(timeLeft / 1000)}s...`);
      }
      this.isThrottled = false;
    }

    const initWithBearer = {
      ...init,
      headers: new Headers({
        Authorization: `Bearer ${this.accessToken}`,
      }),
    };

    const res = await fetch(API_URL + input, initWithBearer);
    switch (res.status) {
      case 200: {
        const responseLength = parseInt(res.headers.get('content-length'), 10);
        return responseLength > 0 ? res.json() : null;
      }
      case 204: {
        return null;
      }
      case 401: {
        if (this.refreshToken) {
          await refreshAccessToken(this.refreshToken);
        }
        break;
      }
      case 429: {
        const retryAfter = parseInt(res.headers.get('retry-after'), 10) + 1;
        if (retryAfter) {
          this.throttleTime = new Date().getTime() + retryAfter * 1000;
          this.isThrottled = true;
        }
        break;
      }
      default: {
        break;
      }
    }

    const { error } = await res.json();
    throw new Error(`${error.status}: ${error.message}`);
  }
}

export const SpotifyApiInstance = new SpotifyApi();
