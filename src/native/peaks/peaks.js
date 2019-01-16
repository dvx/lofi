var peaks = require('bindings')('peaks');

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

(async () => {
  while(true) {
    await sleep(10)
    peaks(function(msg) {
        console.log(msg); // 'hello world' 
    });
  }
})()
