// ======================================
// SCIENTIFIC CALCULATOR
// ======================================

// Elements
const display = document.getElementById("display");
const previousOperand = document.getElementById("previous-operand");

const modeDisplay = document.getElementById("mode");
const modeButton = document.getElementById("mode-button");

const historyContainer = document.getElementById("history-container");
const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");


// Calculator Variables
let expression = "";
let answer = 0;
let isDegree = true;
let calculationHistory = [];
let justCalculated = false;


// ======================================
// DISPLAY FUNCTION
// ======================================

function updateDisplay() {

    display.value = expression || "0";

    modeDisplay.textContent = isDegree ? "DEG" : "RAD";

    modeButton.textContent = isDegree ? "RAD" : "DEG";

}


// ======================================
// BUTTON INPUT
// ======================================

document.querySelectorAll(".buttons button").forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action) {

            handleAction(action);

        } else if (value !== undefined) {

            appendValue(value);

        }

    });

});


// ======================================
// APPEND VALUES
// ======================================

function appendValue(value) {

    if (justCalculated) {

        if (/^[0-9.]$/.test(value) || value === "π" || value === "e" || value === "ANS" || value === "(") {

            expression = "";

        }

        justCalculated = false;

    }

    if (value === "ANS") {

        expression += String(answer);

    } else {

        expression += value;

    }

    updateDisplay();

}


// ======================================
// ACTION HANDLER
// ======================================

function handleAction(action) {

    switch (action) {

        case "clear":

            expression = "";

            previousOperand.textContent = "";

            justCalculated = false;

            updateDisplay();

            break;


        case "delete":

            expression = expression.slice(0, -1);

            justCalculated = false;

            updateDisplay();

            break;


        case "calculate":

            calculate();

            break;


        case "toggle-mode":

            isDegree = !isDegree;

            updateDisplay();

            break;


        case "toggle-sign":

            expression += "-";

            justCalculated = false;

            updateDisplay();

            break;


        case "history":

            historyContainer.classList.toggle("show");

            break;

    }

}


// ======================================
// MATHEMATICAL TOKENIZER
// ======================================

function tokenize(input) {

    const tokens = [];

    const regex = /\s*([0-9]+(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?|(?:sin|cos|tan|sqrt|log|ln|abs)|π|ANS|[A-Za-z]+|[()+\-*/^%!])/gy;

    let position = 0;

    while (position < input.length) {

        regex.lastIndex = position;

        const match = regex.exec(input);

        if (!match) {

            throw new Error("Invalid expression");

        }

        tokens.push(match[1]);

        position = regex.lastIndex;

    }

    return tokens;

}


// ======================================
// MATHEMATICAL PARSER
// ======================================

function parseExpression(input) {

    const tokens = tokenize(input);

    let position = 0;

    function peek() {

        return tokens[position];

    }

    function consume() {

        return tokens[position++];

    }

    function expect(value) {

        if (consume() !== value) {

            throw new Error("Invalid expression");

        }

    }


    // Addition and subtraction

    function parseAddSub() {

        let value = parseMultiply();

        while (peek() === "+" || peek() === "-") {

            const operator = consume();

            const right = parseMultiply();

            value = operator === "+" ? value + right : value - right;

        }

        return value;

    }


    // Multiplication and division

    function parseMultiply() {

        let value = parseUnary();

        while (peek() === "*" || peek() === "/") {

            const operator = consume();

            const right = parseUnary();

            if (operator === "/") {

                if (right === 0) {

                    throw new Error("Cannot divide by zero");

                }

                value /= right;

            } else {

                value *= right;

            }

        }

        return value;

    }


    // Unary plus and minus

    function parseUnary() {

        if (peek() === "+") {

            consume();

            return parseUnary();

        }

        if (peek() === "-") {

            consume();

            return -parseUnary();

        }

        return parsePower();

    }


    // Exponents

    function parsePower() {

        let value = parsePostfix();

        if (peek() === "^") {

            consume();

            const exponent = parseUnary();

            value = Math.pow(value, exponent);

        }

        return value;

    }


    // Factorials and percentages

    function parsePostfix() {

        let value = parsePrimary();

        while (peek() === "!" || peek() === "%") {

            const operator = consume();

            if (operator === "!") {

                value = factorial(value);

            } else {

                value /= 100;

            }

        }

        return value;

    }


    // Numbers, brackets and functions

    function parsePrimary() {

        const token = consume();

        if (token === undefined) {

            throw new Error("Incomplete expression");

        }


        if (token === "(") {

            const value = parseAddSub();

            expect(")");

            return value;

        }


        if (token === "π") {

            return Math.PI;

        }


        if (token === "e") {

            return Math.E;

        }


        if (token === "ANS") {

            return answer;

        }


        if (/^\d/.test(token)) {

            return Number(token);

        }


        const functions = ["sin", "cos", "tan", "sqrt", "log", "ln", "abs"];

        if (functions.includes(token)) {

            expect("(");

            const value = parseAddSub();

            expect(")");

            return calculateFunction(token, value);

        }


        throw new Error("Invalid input");

    }


    const result = parseAddSub();

    if (position !== tokens.length) {

        throw new Error("Invalid expression");

    }

    if (!Number.isFinite(result)) {

        throw new Error("Math error");

    }

    return result;

}


// ======================================
// SCIENTIFIC FUNCTIONS
// ======================================

function calculateFunction(func, value) {

    switch (func) {

        case "sin":

            return Math.sin(isDegree ? value * Math.PI / 180 : value);


        case "cos":

            return Math.cos(isDegree ? value * Math.PI / 180 : value);


        case "tan":

            if (isDegree && Math.abs(value % 180) === 90) {

                throw new Error("Undefined");

            }

            if (!isDegree && Math.abs(Math.cos(value)) < 1e-14) {

                throw new Error("Undefined");

            }

            return Math.tan(isDegree ? value * Math.PI / 180 : value);


        case "sqrt":

            if (value < 0) {

                throw new Error("Invalid square root");

            }

            return Math.sqrt(value);


        case "log":

            if (value <= 0) {

                throw new Error("Invalid logarithm");

            }

            return Math.log10(value);


        case "ln":

            if (value <= 0) {

                throw new Error("Invalid logarithm");

            }

            return Math.log(value);


        case "abs":

            return Math.abs(value);

    }

}


// ======================================
// FACTORIAL FUNCTION
// ======================================

function factorial(number) {

    if (!Number.isInteger(number) || number < 0 || number > 170) {

        throw new Error("Invalid factorial");

    }

    let result = 1;

    for (let i = 2; i <= number; i++) {

        result *= i;

    }

    return result;

}


// ======================================
// MAIN CALCULATION
// ======================================

function calculate() {

    if (!expression) return;

    try {

        const result = parseExpression(expression);

        const formattedResult = Number(result.toPrecision(12));

        previousOperand.textContent = expression + " =";

        answer = formattedResult;

        expression = String(formattedResult);

        justCalculated = true;

        updateDisplay();

        addToHistory(previousOperand.textContent, formattedResult);

    } catch (error) {

        previousOperand.textContent = error.message;

        display.value = "Error";

        expression = "";

        justCalculated = false;

    }

}


// ======================================
// CALCULATION HISTORY
// ======================================

function addToHistory(operation, result) {

    calculationHistory.unshift({

        operation: operation,

        result: result

    });

    if (calculationHistory.length > 20) {

        calculationHistory.pop();

    }

    historyCount.textContent = calculationHistory.length + " Calculations";

    renderHistory();

}


function renderHistory() {

    historyList.innerHTML = "";

    if (calculationHistory.length === 0) {

        historyList.innerHTML = '<p class="empty-history">No calculations yet.</p>';

        return;

    }

    calculationHistory.forEach((item, index) => {

        const historyItem = document.createElement("div");

        historyItem.className = "history-item";

        const operation = document.createElement("span");

        operation.textContent = item.operation;

        const result = document.createElement("strong");

        result.textContent = item.result;

        historyItem.append(operation, result);

        historyItem.addEventListener("click", () => {

            expression = String(item.result);

            answer = item.result;

            justCalculated = true;

            updateDisplay();

            historyContainer.classList.remove("show");

        });

        historyList.appendChild(historyItem);

    });

}


// Clear History

document.getElementById("clear-history").addEventListener("click", () => {

    calculationHistory = [];

    historyCount.textContent = "Ready";

    renderHistory();

});


// ======================================
// KEYBOARD SUPPORT
// ======================================

document.addEventListener("keydown", (event) => {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {

        appendValue(key);

    }

    else if (["+", "-", "*", "/", "^", "(", ")", "%", "!"].includes(key)) {

        appendValue(key);

    }

    else if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

    }

    else if (key === "Backspace") {

        handleAction("delete");

    }

    else if (key === "Escape") {

        handleAction("clear");

    }

});


// ======================================
// INITIALIZE CALCULATOR
// ======================================

updateDisplay();