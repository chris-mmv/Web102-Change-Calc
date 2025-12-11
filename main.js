// denominations array
let denoms = [];

// Always include  penny
const FIXED_PENNY = 0.01;


document.addEventListener("DOMContentLoaded", () => {
  // Initialize Semantic UI checkboxes
  $('.ui.checkbox').checkbox();

  const openBtn  = document.getElementById("openMenuBtn");
  const closeBtn = document.getElementById("closeMenuBtn");
  const overlay  = document.getElementById("popupOverlay");
  const denomEl = document.getElementById("denomDisplay");
  //const outputEl  = document.getElementById("output"); Dont need yet
  const boxes    = document.querySelectorAll(".denom-toggle");

  // Popup open / close 
  openBtn.addEventListener("click", () => {
    overlay.style.display = "flex"; // center via flex
  });

  closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    updateDenomDisplay();
    //console.log("Current denominations after closing popup:", denoms);
  });

  // Function to update denomination display
  function updateDenomDisplay() {
    const disp = document.getElementById("denomDisplay");
    // Build string like: "$20, $10, $5, $1, 0.25, 0.10, 0.05, 0.01"
    const formatted = denoms
      .map(d => d >= 1 ? `$${d}` : `${d * 100}${String.fromCharCode(162)}`)  //was: d.toFixed(2)
      .join(" ");

    // Use Semantic UI "fly left"
    $(disp)
      .transition('fly left', 200)
      .transition({
      animation: 'fly left',
      duration: 2500,
      onStart: () => {
        disp.textContent = //Denominations Used: 
        `${formatted}`;
      }
    });
  }

  // Start fresh
  denoms = [];

  // Always include the penny
  denoms.push(FIXED_PENNY);

  // Initialize checkboxes & denoms array
  boxes.forEach(box => {
    const value = Number(box.value);

    // Bills > $1 default to OFF
    if (value > 1) {
      box.checked = false;
    } else {
      // $1 and coins default to ON
      box.checked = true;
      denoms.push(value);
    }
  });

  // Sort from highest → lowest
  denoms.sort((a, b) => b - a);
  if (denomEl) {
    denomEl.textContent =
      //"Current denominations: " + 
      JSON.stringify(denoms, null, 2);
      updateDenomDisplay();
  }


  

  // Toggle for when checkboxes are changed
  boxes.forEach(box => {
    box.addEventListener("change", (e) => {
      const value = Number(e.target.value);

      if (e.target.checked) {
        if (!denoms.includes(value)) {
          denoms.push(value);
        }
      } else {
        denoms = denoms.filter(v => v !== value);
      }

      // Ensure penny is always present
      if (!denoms.includes(FIXED_PENNY)) {
        denoms.push(FIXED_PENNY);
      }

      denoms.sort((a, b) => b - a);

            if (denomEl) {
        denomEl.textContent =
          //"Current denominations: " + 
          JSON.stringify(denoms, null, 2);
      }
      
    });
  });

});

//  Change Calculation
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
  }

  return result;
}



//  UI Logic for Running Calculator
function runCalc() {
  const owedInput = document.getElementById("amount-due");
  const paidInput = document.getElementById("amount-received");
  const outputEl  = document.getElementById("output");
  const changeDueEl = document.getElementById("change-due");
  changeDueEl.innerHTML = 'Change Due: ' + (paidInput.value - owedInput.value).toFixed(2);

  const owed = Number(owedInput.value);
  const paid = Number(paidInput.value);
  
  

  if (owed > paid) {
    outputEl.textContent = "MORE MONEY IS OWED!";
    return;
  }

  if ((paid - owed) === 0) {
    outputEl.textContent = "Exact amount received. No change due.";
    return;
  }

  //Show change due
  const ChangeAmount = paid - owed;
  changeDueEl.innerHTML = 'Change Due: $' + ChangeAmount.toFixed(2);

  //Run calculation
  const change = calcChange(owed, paid, denoms);

  // Update title after calculation
const denomTitle = document.getElementById("denomTitle");
if (denomTitle) {
  denomTitle.textContent = "Give Change in:";
}

  // Update denominations used display
  const denomEl = document.getElementById("denomDisplay");
  if (denomEl) {
    const usedDenoms = change.map(item => item.denom >= 1 ? `$${item.denom}` : `${item.denom * 100}${String.fromCharCode(162)}`);

    denomEl.textContent = usedDenoms.join(" ");
  }

  // Set per-denomination counts (required for NPM test)
  function setCount(id, denom) {
    const el = document.getElementById(id);
    if (!el) return;
    const item = change.find(r => r.denom === denom);
    el.textContent = item ? item.count : 0;
  }

  //only needed $1 and below, but did them all for completeness
  setCount("twenties-output", 20);
  setCount("tens-output", 10);
  setCount("fives-output", 5);
  setCount("dollars-output", 1);
  setCount("quarters-output", 0.25);
  setCount("dimes-output", 0.10);
  setCount("nickels-output", 0.05);
  setCount("pennies-output", 0.01);

  //output "x count" for each denomination used (remove denoms not used to return change)
  let outputText = ``;
  change.forEach(item => {
    if (item.count > 0) {
      outputText += `x${item.count} `;
    }
  });

  outputEl.textContent = outputText;
  console.log(outputText);

}
