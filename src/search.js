const JSONData = require("../data.json");

const query = "book of 73 photos";
const queryParts = query.split(" ");

const summaries = JSONData.summaries;

const findMatches = () => {
  const matches = [];

  return new Promise(resolve => {
    for (let i = 0, len = summaries.length; i < len; i++) {
      const text = summaries[i].summary.toLowerCase();

      if (text === query.toLowerCase()) {
        matches.push({
          id: i,
          exact: true
        });
        break;
      }

      let score = 0;

      for (let j = 0, qlen = queryParts.length; j < qlen; j++) {
        const qString = queryParts[j];
        score = score + text.split(qString.toLowerCase()).length - 1;
      }

      partialMatch.push({
        id: i,
        exact: false,
        score
      });
    }

    const sortedPartialMatch = partialMatch.sort((a, b) => b.score - a.score);
    resolve({
      fullMatchIndexes,
      partialMatches: sortedPartialMatch
    });
  });
};

findMatches().then(console.log);

// call the function with query string
// take the string and split into chunks for words
