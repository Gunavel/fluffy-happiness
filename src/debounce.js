// Logic
// Keep clearing out the timeout for each click so that the setTimeout which has the fn will get reset.
// If the user stops clicking the last click might have started the setTimeout and the fn will be executed after the timeout as usual
function _debounce(fn, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

export default _debounce;
