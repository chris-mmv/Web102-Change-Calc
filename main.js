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

  // // --- input validation helper (INSIDE DOMContentLoaded) ---
  // function validateInputs() {
  //   const owed = owedInput.value.trim();
  //   const paid = paidInput.value.trim();

  //   if (
  //     owed !== "" &&
  //     paid !== "" &&
  //     !isNaN(Number(owed)) &&
  //     !isNaN(Number(paid))
  //   ) {
  //     calcBtn.disabled = false;
  //   } else {
  //     calcBtn.disabled = true;
  //   }
  // }
  // Hook up input events
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

  // Build a single row that uses the same spacing as the post-calc denom row
  const denomRow = document.createElement("div");
  denomRow.className = "denom-row";

  denoms.forEach(d => {
    const label = d >= 1 ? `$${d}` : `${d * 100}${String.fromCharCode(162)}`;

    const span = document.createElement("span");
    span.textContent = label;
    denomRow.appendChild(span);
  });

  disp.appendChild(denomRow);

  // Optional: animate only if you still want the fly-in effect
  $(disp).transition({
    animation: "fly left in",
    duration: 600
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
  updateDenomDisplay(); // show selected denoms nicely (no JSON)
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

//  UI Logic for Running Calculator
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

  // Animate the message
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

  // Set per-denomination counts (required for NPM test)
  //function setCount(id, denom, label) {
  //const el = document.getElementById(id);
  //if (!el) return;

  //const item = change.find(r => r.denom === denom);

 // if (!item || item.count === 0) {
 //   el.style.display = "none";       // hide unused denominations
 // } else {
 //   el.style.display = "block";      // show only used ones
 //   el.textContent = `${label}: x${item.count}`;
 // }
  //}

  //only needed $1 and below, but did them all for completeness
  //setCount("twenties-output", 20, "$20");
  //setCount("tens-output", 10, "$10");
  //setCount("fives-output", 5, "$5");
  //setCount("dollars-output", 1, "$1");
  //setCount("quarters-output", 0.25, "25¢");
  //setCount("dimes-output", 0.10, "10¢");
  //setCount("nickels-output", 0.05, "5¢");
  //setCount("pennies-output", 0.01, "1¢");

  // Build dynamic <p> elements inside #change-output
  // if (container) {
  //   container.innerHTML = "";  // clear old rows

  //   change.forEach(item => {
  //     if (item.count > 0) {
  //       const row = document.createElement("p");

  //       const label = item.denom >= 1
  //         ? `$${item.denom}`
  //         : `${item.denom * 100}${String.fromCharCode(162)}`;

  //       row.textContent = `${label}:\n x\n${item.count}`;
  //       container.appendChild(row);
  //     }
  //   });
  // }

  // // Optional summary string for #output (just counts)
  // let outputText = "";
  // change.forEach(item => {
  //   if (item.count > 0) {
  //     outputText += `x${item.count} `;
  //   }
  // });

  // outputEl.textContent = outputText.trim();
  // console.log(outputText);
}
