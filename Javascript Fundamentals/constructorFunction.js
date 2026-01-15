// ==========================================================================
// 📘 JAVASCRIPT CONSTRUCTOR FUNCTIONS & PROTOTYPES — COMPLETE NOTES
// ==========================================================================
//
// This file teaches:
//   ✔ What is a constructor function
//   ✔ Role of the `new` keyword
//   ✔ Adding methods inside constructor
//   ✔ Prototype methods (memory optimization)
//   ✔ Object inheritance using prototype
//
// All examples run without errors. Great for exams + interviews.
// ==========================================================================



// ==========================================================================
// 🔹 1. Constructor Function — Concept
// ==========================================================================
//
// A Constructor Function is used to create multiple objects of the same type.
// Naming convention → constructor function names start with CAPITAL letter.
//
// The `new` keyword does:
//   ➤ creates an empty object {}
//   ➤ sets `this` to point to that object
//   ➤ binds properties/methods to that object
//   ➤ returns the object automatically (no return needed)
// ==========================================================================

function Person(name, age) {
    this.name = name;
    this.age = age;
}

// Creating objects using constructor:
let person1 = new Person("Alex", 22);
let person2 = new Person("Riya", 30);
console.log(person1);
console.log(person2);



// ==========================================================================
// 🔹 2. Constructor Example: Car
// ==========================================================================
//
// Best way to create many similar objects:
//
// new Car("Toyota", "Camry");
// new Car("Tata", "Safari");
// ==========================================================================

function Car(make, model) {
    this.make = make;
    this.model = model;
}

let myCar = new Car("Toyota", "Camry");
console.log(myCar);

let myNewCar = new Car("Tata", "Safari");
console.log(myNewCar);



// ==========================================================================
// 🔹 3. Methods Inside Constructor Function
// ==========================================================================
//
// Drawback: every time object is created, the method is copied again → memory heavy.
// Later we will fix this using PROTOTYPE.
// ==========================================================================

function Tea(type) {
    this.type = type;

    // method INSIDE constructor (each object gets a new copy)
    this.describe = function () {
        return `This is a cup of ${this.type}`;
    };
}

let lemonTea = new Tea("lemon tea");
console.log(lemonTea.describe());



// ==========================================================================
// 🔹 4. PROTOTYPE — Most Important Concept
// ==========================================================================
//
// Instead of placing functions inside constructor, we can place them ONCE inside prototype.
// All objects created using the constructor will share that ONE method
// (saves memory, cleaner design)
//
// Every function in JS has a `.prototype` property automatically.
// ==========================================================================

function Animal(species) {
    this.species = species;
}

// Adding method to prototype (shared by all Animal objects)
Animal.prototype.sound = function () {
    return `${this.species} makes a sound`;
};

let dog = new Animal("Dog");
let cat = new Animal("Cat");

console.log(dog.sound()); // Dog makes a sound
console.log(cat.sound()); // Cat makes a sound



// ==========================================================================
// 🔹 Constructor vs Prototype Methods — Difference
// ==========================================================================
//
// Inside constructor → method is duplicated for every new object
//     ❌ memory wastage but flexible
//
// On prototype → method is shared across all objects
//     ✔ memory efficient & recommended
//
// So best practice: put properties inside constructor & methods inside prototype
// ==========================================================================



// ==========================================================================
// 🔹 UNDER THE HOOD — How prototype works
// ==========================================================================
//
// dog.__proto__ → Animal.prototype
// cat.__proto__ → Animal.prototype
//
// Anything inside Animal.prototype becomes accessible to all Animal objects.
// Prototype chain:
//   dog → Animal.prototype → Object.prototype → null
// ==========================================================================



// ==========================================================================
// 🔹 5. BEST PRACTICE PATTERN (REAL-WORLD)
// ==========================================================================
// Constructor = defines properties
// Prototype = defines shared methods
// ==========================================================================

function Student(name, grade) {
    this.name = name;
    this.grade = grade;
}

// Put reusable methods in prototype
Student.prototype.getDetails = function () {
    return `${this.name} is in grade ${this.grade}`;
};

let s1 = new Student("Nived", 10);
console.log(s1.getDetails());



// ==========================================================================
// 🔹 Quick Revision (Interview Level)
// ==========================================================================
//
// ✨ Constructor function → used to create objects
// ✨ `new` keyword → auto-creates object + binds `this` + returns object
// ✨ Methods inside constructor → copied for every object (not memory efficient)
// ✨ Prototype → shared memory-efficient method storage
// ✨ Objects created with constructor inherit methods from prototype
//
// Ultimately:
//     JavaScript OOP uses *PROTOTYPE-BASED INHERITANCE*
// ==========================================================================



// ==========================================================================
// END OF NOTES FILE
// ==========================================================================


// ======================================================================
// ⚡ ADVANCED NOTES — CONSTRUCTOR FUNCTIONS & PROTOTYPES IN JS
// ======================================================================
//
// Includes:
//   ✔ this + new keyword
//   ✔ constructor function rules
//   ✔ methods inside vs outside constructor
//   ✔ prototype inheritance
//   ✔ prototype chain
//   ✔ method overriding
//   ✔ custom inheritance using call() and Object.create()
//   ✔ static-like methods using constructor properties
//   ✔ comparing ES6 Classes with constructors
// ======================================================================



// ======================================================================
// 1️⃣ The NEW Keyword — How it works internally
// ======================================================================
/*
new Constructor():
   1. Creates empty object {}
   2. Sets this = that object
   3. Connects object to prototype
   4. Returns the object automatically
*/
function Person(name, age) {
    this.name = name;
    this.age = age;
}
let p1 = new Person("Aarav", 20);
console.log(p1);



// ======================================================================
// 2️⃣ Methods inside constructor vs. prototype
// ======================================================================

// ❌ Method inside constructor (memory heavy)
function Tea(type) {
    this.type = type;
    this.describe = function () {
        return `This is a cup of ${this.type}`;
    };
}
console.log(new Tea("Lemon Tea").describe());

// ✔ Method on prototype (shared)
function Coffee(type) {
    this.type = type;
}
Coffee.prototype.describe = function () {
    return `Coffee served: ${this.type}`;
};
console.log(new Coffee("Latte").describe());



// ======================================================================
// 3️⃣ Adding MULTIPLE prototype methods
// ======================================================================
function Animal(species) {
    this.species = species;
}
Animal.prototype.sound = function () {
    return `${this.species} makes a sound`;
};
Animal.prototype.run = function () {
    return `${this.species} is running`;
};
 dog = new Animal("Dog");
console.log(dog.sound());
console.log(dog.run());



// ======================================================================
// 4️⃣ Prototype CHAIN — Important to understand
// ======================================================================
console.log(dog.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null



// ======================================================================
// 5️⃣ Method Overriding in Prototype
// ======================================================================
Animal.prototype.sound = function () {
    return `${this.species} barks? maybe?`;
};
console.log(dog.sound()); // overridden version



// ======================================================================
// 6️⃣ Custom Inheritance — Constructor + call() + Object.create()
// ======================================================================
function Vehicle(make) {
    this.make = make;
}
Vehicle.prototype.info = function () {
    return `Make: ${this.make}`;
};

// Car inherits from Vehicle
function Car(make, model) {
    Vehicle.call(this, make); // inherit properties
    this.model = model;
}
Car.prototype = Object.create(Vehicle.prototype); // inherit prototype
Car.prototype.constructor = Car; // reset constructor pointer

Car.prototype.details = function () {
    return `${this.make} ${this.model}`;
};

let c1 = new Car("Toyota", "Fortuner");
console.log(c1.info());
console.log(c1.details());



// ======================================================================
// 7️⃣ PROTOTYPE INHERITANCE CHAIN DIAGRAM (Concept)
//
//  Car → Vehicle → Object → null
//
//  c1.__proto__ === Car.prototype
//  Car.prototype.__proto__ === Vehicle.prototype
//  Vehicle.prototype.__proto__ === Object.prototype
// ======================================================================



// ======================================================================
// 8️⃣ Static-like methods for Constructors
// ======================================================================
function MathUtil() {}
MathUtil.square = function (n) {
    return n * n;
};
console.log(MathUtil.square(8)); // 64



// ======================================================================
// 9️⃣ FACTORY FUNCTION vs CONSTRUCTOR (very important)
// ======================================================================
function createUser(name) {
    return {
        name,
        describe() {
            return `User: ${this.name}`;
        },
    };
}
console.log(createUser("Factory User").describe());

function User(name) {
    this.name = name;
}
User.prototype.describe = function () {
    return `User: ${this.name}`;
};
console.log(new User("Constructor User").describe());



// ======================================================================
// 🔟 ES6 Class = cleaner SYNTAX on top of prototype inheritance
// ======================================================================
class Student {
    constructor(name, roll) {
        this.name = name;
        this.roll = roll;
    }
    details() {
        return `${this.name} (${this.roll})`;
    }
    static school() {
        return "ABC Public School";
    }
}
console.log(new Student("Rohan", 23).details());
console.log(Student.school());



// ======================================================================
// 1️⃣1️⃣ Why ES6 class is NOT real OOP class
// ======================================================================
/*
Even though syntax looks like Java/C++:

class Student { ... }

Internally → JS STILL uses:
- constructor functions
- prototype inheritance
- prototype chain

So JS is Prototype-Based OOP (not classical OOP)
*/



// ======================================================================
// 1️⃣2️⃣ JSON + Object.assign + prototype example (Advanced)
// ======================================================================
let base = { eats: true };
let fish = Object.create(base);
fish.swims = true;
console.log(fish.eats, fish.swims);

let copy = Object.assign({}, fish);
console.log(copy.swims); //  true but no prototype inherited



// ======================================================================
// 1️⃣3️⃣ Object.setPrototypeOf (direct prototype manipulation)
// ======================================================================
let genericCar = { tyres: 4 };
let tesla = { driver: "AI" };
Object.setPrototypeOf(tesla, genericCar);
console.log(tesla.tyres); // inherited through prototype



// ======================================================================
// 1️⃣4️⃣ Best Practices (Industry Level)
// ======================================================================
/*
✔ Put properties inside constructor
✔ Put methods in prototype (not inside constructor)
✔ Use Object.create() instead of Object.setPrototypeOf() (faster)
✔ Use ES6 class for cleaner code but understand prototype
✔ Avoid modifying built-in prototypes directly (dangerous)
*/



// ======================================================================
// 🚀 QUICK INTERVIEW SUMMARY
// ======================================================================
/*
• JS is prototype-based OOP (not classical class-based)
• new → creates object + binds this + sets prototype + returns object
• Every function has .prototype (used only when called with new)
• constructor + prototype = recommended pattern
• Object.create() → best way to create objects with prototype
• Classes are syntax-sugar on top of constructors + prototypes
*/



// ======================================================================
// END OF ADVANCED NOTES FILE
// ======================================================================
