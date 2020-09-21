const chunkArray = require("./helpers/chunk-array");

const MIN_MATCH_CHAR_LENGTH = 2;
const DEFAULT_SUGGESTIONS_COUNT = 3;
const MIN_COLLECTION_LENGTH_PER_ITERATION = 10000;

class CourseBookFinder {
  constructor(summaries) {
    this.collection = summaries;
    this._createCollectionChunks();
  }

  _createCollectionChunks() {
    this.collectionChunks = chunkArray(
      this.collection,
      MIN_COLLECTION_LENGTH_PER_ITERATION
    );
  }

  search(query, suggestionsCount) {
    if (query.length < MIN_MATCH_CHAR_LENGTH) {
      return [];
    }

    const rawQuery = String(query).toLowerCase();
    const words = rawQuery.split(" ");
    const limit = Number(suggestionsCount) || DEFAULT_SUGGESTIONS_COUNT;

    return this._search(rawQuery, words).then(results => {
      return this._formatResults(results, limit);
    });
  }

  _search(rawQuery, words) {
    const chunkPromises = [];
    this.collectionChunks.forEach(collection => {
      const chunkPromise = this._findMatches(rawQuery, words, collection);
      chunkPromises.push(chunkPromise);
    });

    return Promise.all(chunkPromises).then(chunkResults => {
      return this._mergeChunkedResults(chunkResults);
    });
  }

  _findMatches(rawQuery, words, collection) {
    const exactMatches = [];
    const partialMatches = [];

    return new Promise(resolve => {
      for (let i = 0, len = collection.length; i < len; i++) {
        const text = collection[i].summary.toLowerCase();

        if (text === rawQuery) {
          exactMatches.push({
            id: i
          });
          break;
        }

        let score = 0;

        for (let j = 0, wordsLength = words.length; j < wordsLength; j++) {
          const word = words[j];
          score = score + text.split(word).length - 1;
        }

        partialMatches.push({
          id: i,
          score
        });
      }

      const result = {
        exactMatches,
        partialMatches
      };

      resolve(result);
    });
  }

  _mergeChunkedResults(chunkResults) {
    const results = chunkResults.reduce((result, chunk) => {
      result.exactMatches = [result.exactMatches, ...chunk.exactMatches];
      result.partialMatches = [result.partialMatches, ...chunk.partialMatches];

      return result;
    });

    return results;
  }

  _formatResults(results, limit) {
    const { exactMatches, partialMatches } = results;
    const matches = [];

    if (exactMatches.length > 0) {
      matches.push(exactMatches[0]);
    } else {
      const sortedPartialMatches = this._sortMatches(partialMatches);
      matches = sortedPartialMatches.slice(0, limit);
    }

    return this._getCourseBooks(matches);
  }

  _sortMatches(matches) {
    return matches.sort((a, b) => b.score - a.score);
  }

  _getCourseBooks(matches) {
    return books;
  }
}

module.exports = CourseBookFinder;
