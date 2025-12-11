let denominations = [1, 0.25, 0.10, 0.05, 0.01];
let tempPaid = 20.00;
let tempOwed = 10.21;

function calcChange(owed, paid, denomList) {
  let changeDue = paid - owed;

  // Round to nearest cent to prevent float errors
  changeDue = Math.round(changeDue * 100) / 100;

  const result = [];

  for (let d of denomList) {
    const count = Math.floor(changeDue / d);

    if (count > 0) {
      result.push({ denom: d, count });

      

      // Subtract the used amount and re-round
      changeDue = Math.round((changeDue - count * d) * 100) / 100;
    }
    else {result.push({ denom: d, count: 0 });}
  }

  return result;
}

console.table(calcChange(tempOwed, tempPaid, denominations));
const result = calcChange(tempOwed, tempPaid, denominations);

let dollars = result.find(r => r.denom === 1).count;
console.log(dollars)
