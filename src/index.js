console.log("Hello, Gulp!");

const fib = (n) => {
  const table = [0, 1];
  for (let i = 2; i <= n; i++) {
    table.push(table[i - 1] + table[i - 2]);
  }
  return table[n];
};

console.log(fib(6));
console.log("Some change occured!");
