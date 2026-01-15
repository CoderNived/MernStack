// ======================================================================
// 📘 HIGHER ORDER FUNCTIONS & NESTED FUNCTIONS — COMPLETE NOTES
// ======================================================================
//
// This file explains:
//   ✔ What are Higher-Order Functions (HOF)
//   ✔ What are Nested Functions
//   ✔ Closures
//   ✔ Callbacks
//   ✔ Why they are powerful in JS
//   ✔ Examples from beginner → advanced
//
// All code runs without errors. Open it in VS Code / Node / Browser console
// ======================================================================



// ======================================================================
// 🔹 1. What is a Higher-Order Function (HOF)?
// ======================================================================
//
// A Higher-Order Function is a function that:
//  ➤ takes another function as an argument (callback)
//  OR
//  ➤ returns another function
//
// All modern JS features like map, filter, reduce, async programming,
// event handlers are based on HOF.
// ======================================================================



// ----------------------------------------------------------------------
// 🔹 EXAMPLE 1 — HOF taking a function as an argument
// ----------------------------------------------------------------------
function greet(name) {
    return `Hello, ${name}`;
}

// HOF → receives another function as parameter
function processGreeting(callback) {
    return callback("Nived");
}

console.log(processGreeting(greet)); // Hello, Nived



// ----------------------------------------------------------------------
// 🔹 EXAMPLE 2 — HOF returning a function
// ----------------------------------------------------------------------
function multiplyBy(x) {
    return function (y) {
        return x * y;
    };
}

const double = multiplyBy(2); // returns a NEW function
console.log(double(10)); // 20



// ----------------------------------------------------------------------
// 🔹 EXAMPLE 3 — Arrow function version
// ----------------------------------------------------------------------
const power = (base) => (exp) => base ** exp;

console.log(power(2)(5)); // 32
// (2^5)



// ======================================================================
// 🔹 2. What are Nested Functions?
// ======================================================================
//
// When a function is defined inside another function, we call it a
// nested function. Inner function has access to outer function variables.
// ======================================================================



// ----------------------------------------------------------------------
// 🔹 EXAMPLE 4 — Nested function accessing outer variable
// ----------------------------------------------------------------------
function orderTea(teaType) {
    let message = "Order Created";

    function confirmOrder() {
        return `${message} for ${teaType}`;
    }
    return confirmOrder(); // calling nested function inside outer
}

console.log(orderTea("Masala Chai"));



// ======================================================================
// 🔹 3. Closures (MOST IMPORTANT INTERVIEW TOPIC)
// ======================================================================
//
// When a nested function remembers variables from its parent function
// even AFTER the parent function has finished executing — this is closure.
//
// Closure = function + its lexical environment (surrounding variables).
// ======================================================================



// ----------------------------------------------------------------------
// 🔹 EXAMPLE 5 — Using closure to remember data
// ----------------------------------------------------------------------
function counter() {
    let count = 0;

    return function () {
        count++;            // inner function REMEMBERS "count"
        return count;
    };
}

const myCounter = counter();
console.log(myCounter()); // 1
console.log(myCounter()); // 2
console.log(myCounter()); // 3
// parent function is gone, but "count" stays — closure!



/* =======================================================================
🔹 4. HOF + Closure together (Real-world reusable function)
======================================================================= */
function discountCalculator(discountPercent) {
    return function (price) {
        return price - price * (discountPercent / 100);
    };
}

const indianFestivalDiscount = discountCalculator(20);
console.log(indianFestivalDiscount(1000)); // 800



// ======================================================================
// 🔹 5. HOF used heavily in Array methods (MOST IMPORTANT)
// ======================================================================

// map() → transforms array elements
const nums = [1, 2, 3, 4];
const doubled = nums.map(n => n * 2);
console.log("map:", doubled);

// filter() → keep only elements that match a condition
const evenNums = nums.filter(n => n % 2 === 0);
console.log("filter:", evenNums);

// reduce() → accumulate values into a single result
const total = nums.reduce((acc, curr) => acc + curr, 0);
console.log("reduce:", total);



// ======================================================================
// 🔹 6. Callback Functions (core of HOF)
// ======================================================================
//
// A callback is a function passed to another function to run later.
// ======================================================================

// Example:
function makeTea(type) {
    return `Serving ${type}`;
}

function processOrder(callback) {
    return callback("Earl Grey"); // calling callback
}

console.log(processOrder(makeTea));



// ======================================================================
// 🔹 7. Asynchronous HOF examples (important for interviews)
// ======================================================================

// setTimeout → runs callback after delay
setTimeout(() => console.log("Callback inside setTimeout"), 1000);

// setInterval → runs callback repeatedly
let countTimer = 0;
const interval = setInterval(() => {
    countTimer++;
    console.log("Interval count:", countTimer);
    if (countTimer === 3) clearInterval(interval);
}, 500);



// ======================================================================
// 🔹 8. Practical Use Case — Function Factory
// ======================================================================
function teaFactory(type) {
    return function (size) {
        return `${size} cup of ${type} tea prepared`;
    };
}

const gingerTea = teaFactory("Ginger");
console.log(gingerTea("Large")); // Large cup of Ginger tea prepared



// ======================================================================
// 🔹 9. Nested Function with Private Scope Pattern
//     (Modules / Security / Encapsulation)
// ======================================================================
function bankAccount() {
    let balance = 0; // private variable

    function deposit(amount) {
        balance += amount;
        return `Deposited ${amount}. Balance: ${balance}`;
    }

    function withdraw(amount) {
        balance -= amount;
        return `Withdrawn ${amount}. Balance: ${balance}`;
    }

    return { deposit, withdraw }; // returning functions, not value
}

const myAcc = bankAccount();
console.log(myAcc.deposit(100));   // 100
console.log(myAcc.withdraw(40));   // 60



// ======================================================================
// 🔹 10. HOF + Nested Function — Event Handler Example
// ======================================================================
function createEventMessage(eventType) {
    return function (username) {
        return `${username} triggered ${eventType}`;
    };
}

console.log(createEventMessage("LOGIN")("Nived"));



// ======================================================================
// ✔ INTERVIEW QUICK SUMMARY
// ======================================================================
/*
• Higher-Order Function =
      function that takes or returns another function.
• Nested functions =
      functions inside another function.
• Callback =
      function passed as argument.
• Closure =
      inner function remembers variables even after outer finishes.
• map / filter / reduce =
      most used HOFs in JS.
*/



// ======================================================================
// 🎯 IMPORTANT INTERVIEW QUESTIONS TO PRACTICE
// ======================================================================
/*
1. What is a higher-order function? Give examples.
2. Difference between callback and closure?
3. Why does closure remember variables?
4. Build your own map() using a HOF.
5. Explain practical use of closures in authentication/DB/cart apps.
6. Write a function that returns another function and remembers data.
*/


// ======================================================================
// END OF NOTES FILE
// ======================================================================

function greet() {
  return "Hello!";
}

function add(a, b) {
  return a + b;
}


const multiply = function (x, y) {
  return x * y;
};

const sayBye = function () {
  return "Goodbye!";
};


const square = (n) => n * n;

const welcome = (name) => `Welcome, ${name}`;



setTimeout(function () {
  console.log("Anonymous function executed");
}, 1000);

[1, 2, 3].forEach(function (num) {
  console.log(num);
});


(function () {
  console.log("IIFE Executed");
})();

((name) => {
  console.log("Hello", name);
})("Nived");



function callMe() {
  console.log("Callback called!");
}
setTimeout(callMe, 500);

function process(x, callback) {
  return callback(x);
}
console.log(process(5, (n) => n * 2));



function applyTwice(func, num) {
  return func(func(num));
}
console.log(applyTwice((x) => x + 3, 5)); // (5+3)+3

function makeMultiplier(x) {
  return function (y) {
    return x * y;
  };
}
console.log(makeMultiplier(2)(10)); // 20


function outer() {
  function inner() {
    return "Inner function called";
  }
  return inner();
}
console.log(outer());

function orderTea(type) {
  function confirm() {
    return `Tea confirmed: ${type}`;
  }
  return confirm();
}
console.log(orderTea("Masala Chai"));