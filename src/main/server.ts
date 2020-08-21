import * as http from 'http';
import * as url from 'url';
import settings from 'electron-settings';
import { AUTH_BACKEND_PORT } from '../constants';

let server: http.Server;

export function startAuthServer() {
  if (!server) {
    server = http.createServer((request, response) => {
      var queryData = url.parse(request.url, true).query;
      if (queryData.access_token && queryData.refresh_token) {
        settings.set('spotify', queryData);
      }
      response.end('<script>window.close()</script>');
    });
    server.listen(AUTH_BACKEND_PORT);
  }
}

export function stopAuthServer() {
  if (server) {
    server.close();
    server = null;
  }
}
