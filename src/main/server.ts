import * as http from 'http'
import * as settings from 'electron-settings';

export default function startAuthServer() {
  const port = 41419

  const server = http.createServer((request, response) => {
    console.log(request.url)
    response.end('Hello Node.js Server!')
  })
  
  server.listen(port, (err: Error) => {
    if (err) {
      return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
  })
}
