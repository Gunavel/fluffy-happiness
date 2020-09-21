// Logic
// Check if there is a setTimeout fn defined.. if so don't execute the setTimeout func again.
// If no setTimeout exists, start one and make the timer undefined so that next call to this will start another one
function _throttle(fn, ms) {
  let timer;

  return () => {
    if (timer) {
      return;
    }

    timer = setTimeout(() => {
      fn();
      timer = undefined;
    }, ms);
  };
}

export default _throttle;
