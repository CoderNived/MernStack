// Variables
let name = "John";     // Variable that can be reassigned
const age = 30;        // Constant variable that cannot be reassigned
var isStudent = true;  // Older way to declare variables, function-scoped

// Data Types
let number = 42;             // Number
let string = "Hello World";  // String
let isActive = false;        // Boolean
let numbers = [1, 2, 3];     // Array

// Operators
let sum = 10 + 5;          // Arithmetic operator
let isEqual = (10 === 10); // Comparison operator
let isTrue = (true && false); // Logical operator

// Function declaration
function greet(name) {
    return "Hello, " + name;
}

// Function call
let message = greet("John"); // "Hello, John"

// If/Else
if (age >= 18) {
    console.log("You are an adult.");
} else {
    console.log("You are a minor.");
}

// For loop
for (let i = 0; i < 5; i++) {
    console.log(i); // Outputs 0 to 4
}

// While loop
let j = 0;
while (j < 5) {
    console.log(j); // Outputs 0 to 4
    j++;
}

function greet(name){
    return "Hello"+ name;
}

let ans = greet("Harkirat");
let ans1 = greet("Nived");
let ans2 = greet("Math");

console.log(ans);
console.log(ans1);
console.log(ans2);

function sum(a,b){
    return a+b;
}

let Sum=sum(5,7);
console.log(Sum);
// Initiation section
// condition section
// incrementation section
let users = ["Nived","Harkirat","Shenoy","Satya","Hemant"];
for (let i=0;i<5;i++){
    console.log(users[i]);
}

let totalusers = users.length;


// Arrays
const Users = ["harkirat", "raman", "diljeet"];
const tatalUsers = users.length;
const firstUser = users[0];

// Array of Objects
const USers = [
    {
      name: "Harkirat",
      age: 21
    },
    {
      name: "Raman",
      age: 22
    }
  ];
  
  const MY1 = users[0];
  const user1Age = users[0].age;
  
  console.log(MY1);      // { name: 'Harkirat', age: 21 }
  console.log(user1Age);   // 21


  // Object of Objects
  const MY2 = {
	name: "harkirat",
	age: 19,
	address: {
		city: "Delhi",
		country: "India",
		address: "1122 DLF"
	}
}

const city = user1.address.city;
  