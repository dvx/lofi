import * as http from 'http';
import * as url from 'url';
import crypto from 'crypto';
import {
  AUTH_PORT,
  AUTH_SCOPES,
  AUTH_URL,
  AUTH_CLIENT_ID,
  API_URL,
} from '../constants';

let server: http.Server;

export async function startAuth() {
  const codeVerifier = crypto.randomBytes(32).toString('base64');
  const codeState = crypto.randomBytes(32).toString('base64');
  const scopes = AUTH_SCOPES.join('%20');

  const authUrl =
    AUTH_URL +
    `?response_type=code&client_id=${AUTH_CLIENT_ID}&redirect_uri=http://localhost:${AUTH_PORT}&` +
    `scope=${scopes}&state=${codeState}&code_challenge=${codeVerifier}&code_challenge_method=S256`;

  const res = await fetch(authUrl);
  if (res.status !== 200) {
    throw new Error('Failed to retrieve authorization url');
  }

  startAuthProcess(codeState, codeVerifier);

  console.log(authUrl);
  return authUrl;
}

function startAuthProcess(state: string, codeVerifier: string) {
  if (!server) {
    server = http.createServer(async (request, response) => {
      var queryData = url.parse(request.url, true).query;
      try {
        console.log(queryData);
        if (queryData.state === state) {
          if (queryData.error) {
            throw new Error(queryData.error.toString());
          } else if (queryData.code) {
            await retrieveAccessToken(codeVerifier, queryData.code.toString());
          }
        } else {
          throw new Error('Invalid state');
        }
      } finally {
        response.end('<script>window.close()</script>');
        stopServer();
      }
    });
    server.listen(AUTH_PORT);
  }
}

function stopServer() {
  if (server) {
    server.close();
    server = null;
  }
}

async function retrieveAccessToken(codeVerifier: string, code: string) {
  const res = await fetch(API_URL + '/token', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: {
      client_id: AUTH_CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `http://localhost:${AUTH_PORT}`,
      code_verifier: codeVerifier,
    },
  });

  if (res.status !== 200) {
    throw new Error('Failed to retrieve access token');
  }

  console.log(res);
}
