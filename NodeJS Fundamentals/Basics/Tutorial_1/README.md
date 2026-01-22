📘 Node.js Modules Tutorial (CommonJS)

This tutorial explains how modules work in Node.js using require() and module.exports, based on the following example.

📂 Project Structure
project-folder/
│
├── index.js        # Main file (entry point)
├── tutorial.js     # Custom module
└── README.md       # Documentation (this file)

🚀 index.js (Main File)
console.log("Hello from nodeJS");

const tutorial = require('./tutorial');

console.log(tutorial);
console.log(tutorial.sum(1, 1));
console.log(tutorial.pi);

🔍 Explanation

console.log("Hello from nodeJS");

Prints a message to confirm Node.js is running.

require('./tutorial')

Imports the custom module tutorial.js

./ means current directory

tutorial becomes an object containing everything exported from tutorial.js

tutorial.sum(1,1)

Calls the sum function exported from the module

tutorial.pi

Accesses the exported constant pi

📦 tutorial.js (Custom Module)
const sum = (num1, num2) => num1 + num2;
const pi = 3.14;

class SomeMathObject {
    constructor() {
        console.log("Object Created");
    }
}

module.exports.sum = sum;
module.exports.pi = pi;

🧠 Core Concepts Explained
1️⃣ What is a Module in Node.js?

A module is a reusable piece of code

Each file in Node.js is treated as a separate module

Modules help in:

Code reusability

Clean structure

Maintainability

2️⃣ module.exports

Used to export values from a module

Anything attached to module.exports can be accessed using require()

module.exports.sum = sum;
module.exports.pi = pi;


➡️ This exports:

{
  sum: [Function],
  pi: 3.14
}

3️⃣ require()

Used to import a module

Returns the object stored in module.exports

const tutorial = require('./tutorial');

4️⃣ Arrow Function (sum)
const sum = (num1, num2) => num1 + num2;


Takes two numbers

Returns their sum

Short and clean syntax

5️⃣ Constants (pi)
const pi = 3.14;


Stores mathematical constant

Exported for reuse

6️⃣ Classes in Modules
class SomeMathObject {
    constructor() {
        console.log("Object Created");
    }
}


Defines a class

Currently not exported, so it cannot be used outside tutorial.js

To export it:

module.exports.SomeMathObject = SomeMathObject;

📤 Alternative Export Style (IMPORTANT)

Instead of exporting line by line:

module.exports = {
    sum,
    pi,
    SomeMathObject
};


This is cleaner and preferred in real projects.

📥 How to Import Specific Values
const { sum, pi } = require('./tutorial');

console.log(sum(2, 3));
console.log(pi);

⚠️ Common Mistakes
Mistake	Correct
require('tutorial')	require('./tutorial')
Forgetting module.exports	Always export what you need
Using browser JS import	Node uses CommonJS by default
🧪 Output Example
Hello from nodeJS
{ sum: [Function: sum], pi: 3.14 }
2
3.14

📌 Key Takeaways

Every file is a module in Node.js

module.exports decides what is public

require() imports that public interface

Modules prevent global scope pollution

This is called CommonJS Module System