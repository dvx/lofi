import { SpotifyCurrentlyPlaying, SpotifyUserProfile } from '../api/spotify-api';

export enum CurrentlyPlayingType {
  Unknown = 'unknown',
  Track = 'track',
  Ad = 'ad',
  Episode = 'episode',
}

export interface CurrentlyPlaying {
  id: string;
  type: CurrentlyPlayingType;
  track: string;
  artist: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
  cover: string;
  volume: number;
  isLiked: boolean;
  userProfile: SpotifyUserProfile | null;
}

export const INITIAL_STATE: CurrentlyPlaying = {
  id: '',
  type: CurrentlyPlayingType.Unknown,
  track: '',
  artist: '',
  progress: 0,
  duration: 0,
  isPlaying: false,
  cover: '',
  volume: 0,
  isLiked: false,
  userProfile: null,
};

export enum CurrentlyPlayingActions {
  SetCurrentlyPlaying = 'setCurrentlyPlaying',
  SetTrackLiked = 'setTrackLiked',
  SetUserProfile = 'setUserProfile',
}

export type CurrentlyPlayingAction =
  | {
      type: CurrentlyPlayingActions.SetCurrentlyPlaying;
      payload: SpotifyCurrentlyPlaying;
    }
  | {
      type: CurrentlyPlayingActions.SetTrackLiked;
      payload: boolean;
    }
  | {
      type: CurrentlyPlayingActions.SetUserProfile;
      payload: SpotifyUserProfile;
    };

export const useCurrentlyPlayingReducer = (
  state: CurrentlyPlaying,
  action: CurrentlyPlayingAction
): CurrentlyPlaying => {
  switch (action.type) {
    case CurrentlyPlayingActions.SetCurrentlyPlaying: {
      if (!action.payload) {
        return state;
      }
      const {
        item,
        progress_ms: progress,
        is_playing: isPlaying,
        device: { volume_percent: volumePercent },
      } = action.payload;
      if (!item) {
        return state;
      }
      const { album, artists, description, duration_ms: durationMs, id, images, name, type } = item;
      return {
        ...state,
        id,
        type: type as CurrentlyPlayingType,
        track: name,
        artist: artists?.map(({ name: artistName }) => artistName).join(', ') || description,
        progress,
        duration: durationMs,
        isPlaying,
        // eslint-disable-next-line no-nested-ternary
        cover: album?.images?.length > 0 ? album.images[0].url : images.length > 0 ? images[0].url : '',
        volume: volumePercent,
      };
    }

    case CurrentlyPlayingActions.SetUserProfile: {
      return {
        ...state,
        userProfile: action.payload,
      };
    }

    case CurrentlyPlayingActions.SetTrackLiked: {
      return {
        ...state,
        isLiked: action.payload,
      };
    }

    default: {
      return state;
    }
  }
};
