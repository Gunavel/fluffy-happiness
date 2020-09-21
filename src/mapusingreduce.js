if (!Array.mapUsingReduce) {
  Array.prototype.mapUsingReduce = function(callback) {
    return this.reduce((acc, curr, index, array) => {
      acc.push(callback(curr, index, array));
      return acc;
    }, []);
  };
}

console.log(
  [1, 2, 3].mapUsingReduce((curr, index, array) => curr + index + array.length)
);
