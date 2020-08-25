import * as http from 'http';
import * as url from 'url';
import crypto from 'crypto';
import settings from 'electron-settings';
import { AUTH_URL } from '../constants';

let server: http.Server;
let codeState: string;
let codeVerifier: string;

const AUTH_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const AUTH_CLIENT_ID = '0ec1abc52f024530a6e237d7bdc37e65';
const AUTH_PORT = 41419;
const AUTH_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
];

export async function getAuthUrl() {
  codeVerifier = base64URLEncode(crypto.randomBytes(32));
  codeState = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));
  const scopes = AUTH_SCOPES.join('%20');

  const authUrl =
    AUTH_URL +
    `?response_type=code&client_id=${AUTH_CLIENT_ID}&redirect_uri=http://localhost:${AUTH_PORT}&` +
    `scope=${scopes}&state=${codeState}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  return authUrl;
}

export async function startAuthServer() {
  console.log('Starting auth server...');
  if (!server) {
    server = http.createServer(async (request, response) => {
      var queryData = url.parse(request.url, true).query;
      try {
        if (queryData.state === codeState) {
          if (queryData.error) {
            throw new Error(queryData.error.toString());
          } else if (queryData.code) {
            const { access_token, refresh_token } = await retrieveAccessToken(
              codeVerifier,
              queryData.code.toString()
            );
            updateSettings(access_token, refresh_token);
          }
        } else {
          throw new Error('Invalid state');
        }
      } catch (e) {
        console.error(e);
      } finally {
        response.end('<script>window.close()</script>');
        stopServer();
      }
    });

    server.listen(AUTH_PORT);
  }
}

export async function refreshAccessToken(refreshToken: string) {
  console.log('Refreshing access token...');

  const body =
    `client_id=${AUTH_CLIENT_ID}&grant_type=refresh_token&` +
    `refresh_token=${refreshToken}`;

  const res = await fetch(AUTH_TOKEN_URL, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: body,
  });

  if (res.status !== 200) {
    throw new Error(
      `status ${
        res.status
      }: Failed to retrieve access token\n${res
        .text()
        .then((text) => console.log(text))}`
    );
  }

  const { access_token, refresh_token } = JSON.parse(await res.text());
  updateSettings(access_token, refresh_token);
}

function base64URLEncode(str: Buffer) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(str: string) {
  return crypto.createHash('sha256').update(str).digest();
}

function stopServer() {
  if (server) {
    server.close();
    server = null;
  }
}

function updateSettings(access_token: string, refresh_token: string) {
  settings.setSync('access_token', access_token);
  settings.setSync('refresh_token', refresh_token);
}

async function retrieveAccessToken(codeVerifier: string, code: string) {
  console.log('Retrieving access token...');

  const body =
    `client_id=${AUTH_CLIENT_ID}&grant_type=authorization_code&` +
    `code=${code}&redirect_uri=http://localhost:${AUTH_PORT}&code_verifier=${codeVerifier}`;

  const res = await fetch(AUTH_TOKEN_URL, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: body,
  });

  if (res.status !== 200) {
    throw new Error(
      `status ${
        res.status
      }: Failed to retrieve access token\n${res
        .text()
        .then((text) => console.log(text))}`
    );
  }

  const authData = await res.text();

  return JSON.parse(authData);
}
