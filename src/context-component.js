/**
 * Notes:
 * - See how the context is created and used. While creating default value is provided. Make sure to use
 * whatever the shape (eg. object, string) used in default value while creating actual context value
 * - Provider should have a `value` prop where you can specify the acutal values to use
 * - Consumer can be a class or functional componenet
 * - See how consumer class component reads the context (`this.context` and `static contextType = CountContext`;)
 * - See how functional component reads the context. like `render prop value` {(value) => {}}
 * - If the parent provider `value` prop changes, the entire consumer components are *re-rendered*
 * and *not* subject to `shouldComponentUpdate`
 */
import React, { useState } from "react";
import PropTypes from "prop-types";

const CountContext = React.createContext({
  count: 0,
  increment: () => {}
});

function ButtonConsumer() {
  return (
    <CountContext.Consumer>
      {contextValue => (
        <div>
          <p>Count: {contextValue.count}</p>
          <button onClick={contextValue.increment}>Increment</button>
        </div>
      )}
    </CountContext.Consumer>
  );
}

class ButtonConsumerClass extends React.Component {
  static contextType = CountContext;

  static contextTypes = {
    count: PropTypes.number,
    increment: PropTypes.func
  };

  render() {
    const { count, increment } = this.context;

    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  }
}

function ContextComponent() {
  const [count, incrementCount] = useState(0);

  const increment = () => {
    incrementCount(count + 1);
  };
  const contextValue = { count, increment };

  return (
    <CountContext.Provider value={contextValue}>
      <ButtonConsumer />
      <ButtonConsumerClass />
    </CountContext.Provider>
  );
}

export default ContextComponent;
