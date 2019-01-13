import * as http from 'http'
import * as url from 'url'
import * as settings from 'electron-settings';

export default function startAuthServer() {
  const port = 41419

  const server = http.createServer((request, response) => {
    var queryData = url.parse(request.url, true).query;
    if (queryData.access_token && queryData.refresh_token) {
      settings.set('spotify', queryData);
    }
    response.end('<script>window.close()</script>')
  })
  
  server.listen(port, (err: Error) => {
    if (err) {
      return console.log('something bad happened', err)
    }
  })
}
