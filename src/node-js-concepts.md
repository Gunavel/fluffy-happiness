Node js - An asynchronous event-driven javascript runtime built on top on chrome's v8 engine.

- Non blocking
- Single threaded
- No function is executed directly on I/O thread, so it does not block hence scalable systems are efficient to build on node js
- Mulithreaded can be achieved via child_process.fork() which is provided by cluster module to make use of multi cores cpu

How to find if we are on node https server

- The req should contain req.socket.encrypted

Concurrency and Throughput
JavaScript execution in Node.js is single threaded,
so concurrency refers to the event loop's capacity to execute JavaScript callback functions after completing other work.
Any code that is expected to run in a concurrent manner must allow the event loop to continue running as non-JavaScript operations, like I/O, are occurring.
As an example, let's consider a case where each request to a web server takes 50ms to complete and 45ms of that 50ms is database I/O that can be done asynchronously. Choosing non-blocking asynchronous operations frees up that 45ms per request to handle other requests.
This is a significant difference in capacity just by choosing to use non-blocking methods instead of blocking methods.

Event loop
In summary, the Event Loop executes the JavaScript callbacks registered for events, and is also responsible for fulfilling non-blocking asynchronous requests like network I/O.

- this is what makes node.js to perform non-blocking I/O operations despite JavaScript being single threaded by offloading operations to system kernel
- Between each run of the event loop the node js checks if there are any async I/O or timers and shuts down cleanly
- there are 8 phases in event loop
- When node is initialized, the input script file is provided to REPL and starts processing the event loop
- Event loop enters in each phase and perform any ops on that phase and execute any callback in phase's callback queue

Phases Overview

- timers: this phase executes callbacks scheduled by setTimeout() and setInterval().
- pending callbacks: executes I/O callbacks deferred to the next loop iteration.
- idle, prepare: only used internally.
- poll: retrieve new I/O events; execute I/O related callbacks (almost all with the exception of close callbacks, the ones scheduled by timers, and setImmediate()); node will block here when appropriate.
- check: setImmediate() callbacks are invoked here.
- close callbacks: some close callbacks, e.g. socket.on('close', ...).

setTimeout vs setImmediate
setTimeout - executes the script after certain time has elapsed
setImmediate - exectues immediately after the poll phase has been completed.. see above for poll phases
eg: 1.
setTimeout(() => {
console.log('timeout');
}, 0);
setImmediate(() => {
console.log('immediate');
});
\$ node timeout_vs_immediate.js
timeout
immediate

2.
const fs = require('fs');
fs.readFile(\_\_filename, () => {
setTimeout(() => {
console.log('timeout');
}, 0);
setImmediate(() => {
console.log('immediate');
});
});
\$ node timeout_vs_immediate.js
immediate
timeout
Since setImmediate is called within I/O callback, it is first called after I/O completion (poll phase)

REPL - simply a node shell
node simple.js - starts REPL (Read, Eval, Print, Loop)

Prevent DDOS

- Process the incoming requests or perform blocking operations asynchronously using callbacks
- Rate limiting

What code runs in Event loop
In summary, the Event Loop executes the JavaScript callbacks registered for events,
and is also responsible for fulfilling non-blocking asynchronous requests like network I/O.

What code runs in Worker Pool

- Node uses this pool to handle expensive task
- some node module api make use of this pool
  - cpu intesive - crypto module
  - i/o intesive - file system, dns modules

Express - built on top of node's connect module. similar to http module and serves as middleware to handle http requests

Buffer module - to handle binary data which is not supported by pure javascript

Streams - Used to read data from source and write to dest continuously
