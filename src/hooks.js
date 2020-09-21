function Table(props) {
  // ⚠️ createRows() is called on every render
  const [rows, setRows] = useState(createRows(props.count));
  // ...
}

function Table(props) {
  // ✅ createRows() is only called once
  const [rows, setRows] = useState(() => createRows(props.count));
  // ...
}
// React will only call this function during the first render. See the useState API reference.

// https://reacttraining.com/blog/react-inline-functions-and-performance/
// There are six primitive types in JavaScript: string, number, boolean, null, undefined, and symbol.
// When you do a “strict equality comparison” on two primitives that hold the same value, you’ll get true
// There is only one other type and that’s Object. What about functions and arrays you say? Well, actually those are just objects.
// Functions are regular objects with the additional capability of being callable.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures

const one = { n: 1 };
const uno = { n: 1 };
one === uno; // false
one === one; // true

// https://codesandbox.io/s/nostalgic-khayyam-gzxdm?file=/index.js
