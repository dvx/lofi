import * as http from 'http';
import * as url from 'url';
import crypto from 'crypto';
import settings from 'electron-settings';
import { AUTH_PORT, AUTH_SCOPES, AUTH_URL, AUTH_CLIENT_ID } from '../constants';

let server: http.Server;

export async function startAuth() {
  const codeVerifier = crypto.randomBytes(32).toString('base64');
  const codeState = crypto.randomBytes(32).toString('base64');
  const scopes = AUTH_SCOPES.join('%20');

  const authUrl =
    AUTH_URL +
    `?response_type=code&client_id=${AUTH_CLIENT_ID}&redirect_uri=http://localhost:${AUTH_PORT}&` +
    `scope=${scopes}&state=${codeState}&code_challenge=${codeVerifier}&code_challenge_method=S256`;

  startAuthServer();

  const res = await fetch(authUrl);

  if (res.status !== 200) {
    throw new Error('Failed to retrieve authorization url');
  }

  return authUrl;
}

function startAuthServer() {
  if (!server) {
    server = http.createServer((request, response) => {
      var queryData = url.parse(request.url, true).query;
      console.log(queryData);

      // if (queryData.access_token && queryData.refresh_token) {
      //   settings.set('spotify', queryData);
      // }
      response.end('<script>window.close()</script>');
    });
    server.listen(AUTH_PORT);
  }
}

// function stopAuthServer() {
//   if (server) {
//     server.close();
//     server = null;
//   }
