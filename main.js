// denominations array
let denoms = [];

// Always include  penny
const FIXED_PENNY = 0.01;

let hasAnimatedChangeDue = false;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Semantic UI checkboxes
  $('.ui.checkbox').checkbox();

  const openBtn   = document.getElementById("openMenuBtn");
  const closeBtn  = document.getElementById("closeMenuBtn");
  const overlay   = document.getElementById("popupOverlay");
  const denomEl   = document.getElementById("denomDisplay");
  const boxes     = document.querySelectorAll(".denom-toggle");
  const owedInput = document.getElementById("amount-due");
  const paidInput = document.getElementById("amount-received");
  const calcBtn   = document.getElementById("calculate-change");


  // input events
  owedInput.addEventListener("input", validateInputs);
  paidInput.addEventListener("input", validateInputs);

  // Run once on load to set initial state
  validateInputs();

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
  if (!disp) return;

  // Clear existing content
  disp.innerHTML = "";

  // Build single
  const denomRow = document.createElement("div");
  denomRow.className = "denom-row";

  denoms.forEach(d => {
    const label = d >= 1 ? `$${d}` : `${d * 100}${String.fromCharCode(162)}`;

    const span = document.createElement("span");
    span.textContent = label;
    denomRow.appendChild(span);
  });

  disp.appendChild(denomRow);

  // animate the fly-in effect
  $(disp).transition({
    animation: "fly left in",
    duration: 600
  });
}

  // Start fresh
  denoms = [];

  // Always include penny
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
  updateDenomDisplay(); // show selected denoms
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
  updateDenomDisplay();
}

      
    });
  });

  window.updateDenomDisplay = updateDenomDisplay;

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

//  Set test outputs for NPM tests
function setTestOutputs(change) {
  const map = {
    1: "dollars-output",
    0.25: "quarters-output",
    0.10: "dimes-output",
    0.05: "nickels-output",
    0.01: "pennies-output"
  };

  Object.entries(map).forEach(([denom, id]) => {
    const el = document.getElementById(id);
    if (!el) return;

    const item = change.find(c => c.denom === Number(denom));
    el.textContent = item ? item.count : 0;
  });
}


//  Enable calc button after inputs are valid
function validateInputs() {
  const owedInput = document.getElementById("amount-due");
  const paidInput = document.getElementById("amount-received");
  const calcBtn   = document.getElementById("calculate-change");

  const owed = owedInput.value.trim();
  const paid = paidInput.value.trim();

  // Enable only when BOTH fields contain something
  if (owed !== "" && paid !== "" && !isNaN(Number(owed)) && !isNaN(Number(paid))) {
    calcBtn.disabled = false;
  } else {
    calcBtn.disabled = true;
  }
}

//  Run Calculator
function runCalc() {
  const owedInput    = document.getElementById("amount-due");
  const paidInput    = document.getElementById("amount-received");
  const changeDueEl  = document.getElementById("change-due");
  const denomEl      = document.getElementById("denomDisplay");
  const denomTitle   = document.getElementById("denomTitle");
  //changeDueEl.innerHTML = 'Change Due: ' + (paidInput.value - owedInput.value).toFixed(2);

  const owed = Number(owedInput.value);
  const paid = Number(paidInput.value);

    
  // Basic check
  if (!owedInput.value || !paidInput.value || isNaN(owed) || isNaN(paid)) {
  if (changeDueEl) changeDueEl.textContent = "You must input dollar amounts prior to calculating.";
  if (denomTitle) denomTitle.textContent = "Denominations Selected";

  // Restore the pre-calculation denomination view
  if (typeof updateDenomDisplay === "function") updateDenomDisplay();

  // Animate message
  $(changeDueEl).transition("fly left in");

  return;
}

  // Case 1: not enough money
  if (owed > paid) {
    if (changeDueEl) changeDueEl.textContent = "MORE MONEY IS OWED!";
    if (denomTitle) denomTitle.textContent = "Denominations Selected";
    // Show current selected denominations again (pre-calc view)
    if (typeof updateDenomDisplay === "function") updateDenomDisplay();
    $(changeDueEl).transition('fly left in');
    return;
  }

  // Case 2: exact amount
  if (paid === owed) {
    if (changeDueEl) changeDueEl.textContent = "Exact amount received. No change due.";
    if (denomTitle) denomTitle.textContent = "Denominations Selected";
    if (typeof updateDenomDisplay === "function") updateDenomDisplay();
    $(changeDueEl).transition('fly left in');
    return;
  }

  // Normal case: paid > owed then compute change
  const changeAmount = paid - owed;
  
  if (changeDueEl) {
  changeDueEl.textContent = "Change Due: $" + changeAmount.toFixed(2);

  if (!hasAnimatedChangeDue) {
    $(changeDueEl).transition('fly left in');
    hasAnimatedChangeDue = true;
  }
}
  
  // Run calculation
  const change = calcChange(owed, paid, denoms);
  if (!change.length) {
  if (denomTitle) denomTitle.textContent = "Denominations Selected";
  if (typeof updateDenomDisplay === "function") updateDenomDisplay();
  return;
}
  // Set the test outputs for NPM tests
  setTestOutputs(change);

  // Update title for "after" view
  if (denomTitle) {
    denomTitle.textContent = "Give Change in:";
  }

  // Build two rows: denominations (top) and x-counts (bottom)
  if (denomEl) {
    denomEl.innerHTML = "";

    const denomRow = document.createElement("div");
    denomRow.className = "denom-row";

    const countRow = document.createElement("div");
    countRow.className = "count-row";

    change.forEach(item => {
      if (item.count > 0) {
        // Format label: $20 vs 25¢
        const label = item.denom >= 1
          ? `$${item.denom}`
          : `${item.denom * 100}${String.fromCharCode(162)}`;

        const denomSpan = document.createElement("span");
        denomSpan.textContent = label;
        denomRow.appendChild(denomSpan);

        const countSpan = document.createElement("span");
        countSpan.textContent = `x${item.count}`;
        countRow.appendChild(countSpan);
      }
    });

    denomEl.appendChild(denomRow);
    denomEl.appendChild(countRow);
  }

}
