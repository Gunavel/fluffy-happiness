import React from "react";
import ReactDOM from "react-dom";

// React elements are immutable means you can't change its children or attributes once it is created
// so element.type = 'something' throws runtime error.
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  );

  ReactDOM.render(element, document.getElementById("test"));
}

/**
 * Even though we create an element describing the whole UI tree on every tick,
 * only the text node whose contents have changed gets updated by React DOM.
 *
 * See in browser devtools that only `h2` tags value gets updated
 */
setInterval(tick, 1000);
