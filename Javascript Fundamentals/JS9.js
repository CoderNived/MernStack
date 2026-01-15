// =======================================================
// LOOPS IN JAVASCRIPT – COMPLETE NOTES WITH EXAMPLES
// Save this file as: loops_notes.js
// Run using: node loops_notes.js   (in terminal)
// or in the browser console.
// =======================================================

// -----------------------------
// 1. BASIC WHILE LOOP
// -----------------------------
// A while loop repeats as long as the condition is true.

console.log("===== 1. BASIC WHILE LOOP =====");

let counter = 1; // start from 1
// Problem: Print numbers from 1 to 5
while (counter <= 5) {
    console.log("counter:", counter);
    counter++; // VERY IMPORTANT: change the variable, or infinite loop!
}

// -----------------------------
// 2. WHILE LOOP – SUM OF NUMBERS
// -----------------------------
// Problem: Find sum of numbers from 1 to 5

console.log("\n===== 2. WHILE LOOP – SUM =====");

let i = 1;
let sum = 0;
while (i <= 5) {
    sum += i; // sum = sum + i
    i++;
}
console.log("Sum from 1 to 5:", sum); // 15


// -----------------------------
// 3. DO...WHILE LOOP – INTRO
// -----------------------------
// do...while runs the body AT LEAST ONCE, then checks condition.

console.log("\n===== 3. DO...WHILE LOOP – AT LEAST ONCE =====");

let num = 10;
do {
    console.log("This runs once even if condition is false. num =", num);
    num++;
} while (num < 5); // condition false, but body still ran once


// -----------------------------
// 4. DO...WHILE – SUM EXAMPLE
// -----------------------------
// Problem: Sum numbers from 1 to 3 using do...while

console.log("\n===== 4. DO...WHILE – SUM 1 TO 3 =====");

let k = 1;
let total = 0;
do {
    total += k;
    k++;
} while (k <= 3);

console.log("Total from 1 to 3:", total); // 6


// -----------------------------
// 5. BASIC FOR LOOP
// -----------------------------
// Syntax: for (initialization; condition; increment) { ... }

console.log("\n===== 5. BASIC FOR LOOP – PRINT 1 TO 5 =====");

for (let x = 1; x <= 5; x++) {
    console.log("x:", x);
}


// -----------------------------
// 6. FOR LOOP – REVERSE COUNTDOWN
// -----------------------------
// Problem: Create an array [5, 4, 3, 2, 1, 0]

console.log("\n===== 6. FOR LOOP – COUNTDOWN ARRAY =====");

let countdown = [];
for (let j = 5; j >= 0; j--) {
    countdown.push(j);
}
console.log("Countdown:", countdown);


// -----------------------------
// 7. FOR LOOP – ARRAY PROCESSING
// -----------------------------
// Problem: Given [2,4,6], create a new array with each number * 2

console.log("\n===== 7. FOR LOOP – MULTIPLY ARRAY ELEMENTS =====");

let nums = [2, 4, 6];
let multiplied = [];

for (let index = 0; index < nums.length; index++) {
    let mul = nums[index] * 2;
    multiplied.push(mul);
}
console.log("Original:", nums);
console.log("Multiplied by 2:", multiplied);


// -----------------------------
// 8. FOR...OF LOOP – ARRAY VALUES
// -----------------------------
// for...of is used to loop over VALUES of an iterable (like arrays, strings)

console.log("\n===== 8. FOR...OF – LOOP OVER ARRAY VALUES =====");

let teas = ["chai", "green tea", "herbal tea", "black tea"];
for (const tea of teas) {
    console.log("Tea:", tea);
}


// -----------------------------
// 9. FOR...OF – BUILD NEW ARRAY (SKIP ONE VALUE USING CONTINUE)
// -----------------------------
// Problem: Copy all teas except "herbal tea"

console.log("\n===== 9. FOR...OF + CONTINUE – SKIP 'herbal tea' =====");

let preferredTeas = [];
for (const tea of teas) {
    if (tea === "herbal tea") {
        // skip this iteration
        continue;
    }
    preferredTeas.push(tea);
}
console.log("Preferred teas:", preferredTeas);
// ["chai", "green tea", "black tea"]


// -----------------------------
// 10. FOR...IN LOOP – OBJECT KEYS
// -----------------------------
// for...in is used to loop over KEYS of an object.

console.log("\n===== 10. FOR...IN – LOOP OVER OBJECT KEYS =====");

let citiesPopulation = {
    London: 8900000,
    Amsterdam: 821752,
    Mumbai: 20411000,
    Ahmedabad: 5570585,
    Pune: 3124458,
};

let cityCopy = {};

console.log("Values via Object.values:", Object.values(citiesPopulation));

for (const key in citiesPopulation) {
    // hasOwnProperty check (best practice to ensure it's the object's own key)
    if (Object.prototype.hasOwnProperty.call(citiesPopulation, key)) {
        const population = citiesPopulation[key];
        console.log(`City: ${key}, Population: ${population}`);
        cityCopy[key] = population; // copy to new object
    }
}

console.log("Copied object:", cityCopy);


// -----------------------------
// 11. FOR...IN LOOP – ARRAY INDICES
// -----------------------------
// for...in on arrays gives INDEX (as string), not values.

console.log("\n===== 11. FOR...IN – LOOP OVER ARRAY INDICES =====");

let cities = ["London", "New York", "Paris", "Berlin"];
for (const index in cities) {
    console.log(`Index: ${index}, Value: ${cities[index]}`);
}


// -----------------------------
// 12. BREAK IN LOOPS
// -----------------------------
// break exits the loop completely.

console.log("\n===== 12. BREAK – STOP WHEN FOUND 'Chai' =====");

let teaTypes = ["green tea", "black tea", "Chai", "oolong tea"];
let selectedTeas = [];

for (let iTea = 0; iTea < teaTypes.length; iTea++) {
    if (teaTypes[iTea] === "Chai") {
        console.log("Found 'Chai', stopping loop.");
        break; // exit the loop
    }
    selectedTeas.push(teaTypes[iTea]);
}
console.log("Teas before 'Chai':", selectedTeas);


// -----------------------------
// 13. CONTINUE IN LOOPS
// -----------------------------
// continue skips the current iteration and goes to the next.

console.log("\n===== 13. CONTINUE – SKIP 'Paris' =====");

let visitedCities = [];
for (let iCity = 0; iCity < cities.length; iCity++) {
    if (cities[iCity] === "Paris") {
        console.log("Skipping Paris");
        continue; // skip push for 'Paris'
    }
    visitedCities.push(cities[iCity]);
}
console.log("Visited cities (without Paris):", visitedCities);


// -----------------------------
// 14. NESTED LOOPS – MULTIPLICATION TABLE
// -----------------------------
// Problem: Print a 1 to 3 multiplication table

console.log("\n===== 14. NESTED LOOPS – MULTIPLICATION TABLE (1 TO 3) =====");

for (let a = 1; a <= 3; a++) {
    for (let b = 1; b <= 3; b++) {
        console.log(`${a} x ${b} = ${a * b}`);
    }
}


// -----------------------------
// 15. NESTED LOOPS + BREAK (LABELED BREAK – ADVANCED)
// -----------------------------
// Labeled break lets us break out of an outer loop from inside an inner loop.

console.log("\n===== 15. LABELED BREAK – STOP BOTH LOOPS WHEN VALUE > 5 =====");

outerLoop: // label for outer loop
for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
        let value = row * col;
        console.log(`row=${row}, col=${col}, value=${value}`);

        if (value > 5) {
            console.log("Value > 5, breaking OUT of both loops using labeled break.");
            break outerLoop; // breaks the outer 'outerLoop'
        }
    }
}


// -----------------------------
// 16. LOOPING OVER STRING CHARACTERS
// -----------------------------
// Strings are iterable, can use for...of

console.log("\n===== 16. FOR...OF – LOOP OVER STRING CHARACTERS =====");

let word = "LOOP";
for (const char of word) {
    console.log("Character:", char);
}


// -----------------------------
// 17. LOOPING OVER MAP (ADVANCED)
// -----------------------------
// Map stores key-value pairs and preserves insertion order.

console.log("\n===== 17. FOR...OF – LOOP OVER MAP =====");

// Creating a Map of city -> country
let cityCountryMap = new Map();
cityCountryMap.set("London", "UK");
cityCountryMap.set("Mumbai", "India");
cityCountryMap.set("Tokyo", "Japan");

// Loop over [key, value] pairs
for (const [cityName, countryName] of cityCountryMap) {
    console.log(`${cityName} is in ${countryName}`);
}


// -----------------------------
// 18. LOOPING OVER SET (ADVANCED)
// -----------------------------
// Set stores unique values.

console.log("\n===== 18. FOR...OF – LOOP OVER SET =====");

let numberSet = new Set([1, 2, 2, 3, 3, 4]);
console.log("Set content:", numberSet);

for (const value of numberSet) {
    console.log("Set value:", value);
}


// -----------------------------
// 19. PRACTICAL PROBLEM – FILTER USING LOOPS
// -----------------------------
// Problem: From an array of numbers, create a new array of only even numbers.

console.log("\n===== 19. PRACTICAL – FILTER EVEN NUMBERS USING LOOP =====");

let mixedNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
let evenNumbers = [];

for (let idx = 0; idx < mixedNumbers.length; idx++) {
    if (mixedNumbers[idx] % 2 === 0) {
        evenNumbers.push(mixedNumbers[idx]);
    }
}
console.log("Original:", mixedNumbers);
console.log("Even numbers:", evenNumbers);


// -----------------------------
// 20. AVOIDING INFINITE LOOPS (IMPORTANT CONCEPT)
// -----------------------------
// Infinite loop happens when condition never becomes false.
// Example (DO NOT UNCOMMENT THIS!):
// while (true) {
//     console.log("I will never stop");
// }
// Always make sure your loop variable is updated properly.

console.log("\n===== 20. NOTE – AVOID INFINITE LOOPS =====");
console.log("Always ensure your loop condition will eventually become false.");


// =======================================================
// END OF LOOPS NOTES FILE
// =======================================================
