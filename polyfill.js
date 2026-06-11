if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const arr = [...this];
    arr.splice(start, deleteCount, ...items);
    return arr;
  };
}
if (!Array.prototype.with) {
  Array.prototype.with = function(index, value) {
    const arr = [...this];
    const actualIndex = index < 0 ? arr.length + index : index;
    arr[actualIndex] = value;
    return arr;
  };
}
console.log("ES2023 Polyfills loaded successfully.");
