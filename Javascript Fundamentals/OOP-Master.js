// ======================================================================
// 📘 JAVASCRIPT — OBJECTS, CONSTRUCTOR FUNCTIONS, PROTOTYPES & CLASSES
// ======================================================================
// Covers:
//  ✔ Object literal with methods
//  ✔ Constructor functions
//  ✔ Prototype methods
//  ✔ Extending built-in prototypes
//  ✔ ES6 Classes & Inheritance
// ======================================================================



// ======================================================================
// 1️⃣ Object Literal (Simplest way to create an object)
// ======================================================================
let car = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    start() {
        return `${this.make} car got started in ${this.year}`;
    },
};
console.log(car.start());



// ======================================================================
// 2️⃣ Constructor Function + new keyword
// ======================================================================
// Used for creating multiple objects following same structure
function Person(name, age) {
    this.name = name;
    this.age = age;
}
let john = new Person("John Doe", 20);
console.log(john.name); // John Doe



// ======================================================================
// 3️⃣ Prototype Method (memory-efficient)
// ======================================================================
// Adds method SHARED by all objects created from this constructor
function Animal(type) {
    this.type = type;
}
Animal.prototype.speak = function () {
    return `${this.type} makes a sound`;
};

let dog = new Animal("Dog");
console.log(dog.speak());



// ======================================================================
// 4️⃣ Extending Built-in Prototypes (⚠ be careful)
// ======================================================================
// You CAN extend built-ins like Array, but not recommended for real projects
Array.prototype.nived = function () {
    return `Custom method on array → ${this}`;
};

let myarray = [1, 2, 3, 4, 5];
console.log(myarray.nived());
let mynewarray = [1, 2, 3, 4, 5, 6];
console.log(mynewarray.nived());



// ======================================================================
// 5️⃣ ES6 Class Syntax (cleaner syntax on top of prototype-based OOP)
// ======================================================================
// ⛔ Your code had an error: class vehicle() { } ❌ — parentheses not allowed
// ✔ Correct syntax: class Vehicle { }
class Vehicle {
    constructor(make, model) {
        this.make = make;
        this.model = model;
    }
    start() {
        return `${this.model} is a car from ${this.make}`;
    }
}



// ======================================================================
// 6️⃣ Class Inheritance using extends & super()
// ======================================================================
// Car will inherit Vehicle properties and methods
class Car extends Vehicle {
    constructor(make, model) {
        super(make, model); // calls parent constructor
    }
    drive() {
        return `${this.make}: This is an inheritance example`;
    }
}

let mycar = new Car("Toyota", "Corolla");
console.log(mycar.start()); // method inherited from Vehicle
console.log(mycar.drive()); // method from Car class



// ======================================================================
// 🔥 QUICK REVISION SUMMARY
// ======================================================================
/*
📌 Object Literal
    - Simple object with key-value pairs
    - Supports methods

📌 Constructor Function
    - Creates multiple similar objects using new keyword

📌 Prototype
    - Best place for shared methods (memory optimized)
    - "Object inherits from prototype"

📌 Extending Built-in Prototypes
    - Technically allowed but risky in real applications

📌 Class (ES6)
    - Cleaner syntax for constructor + prototype
    - Still prototype-based under the hood

📌 Inheritance (extends + super)
    - Reuse logic from parent class
    - Child can add its own methods

⭐ FINAL TRUTH: JavaScript is a PROTOTYPE-BASED OOP language.
    ES6 Classes are syntactic sugar over prototypes, not real classical classes.
*/
