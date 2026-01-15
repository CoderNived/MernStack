// ===============================
// 1. while loop – sum from 1 to 5
// ===============================

let sum = 0;      // start sum at 0
let i = 1;        // start i at 1

// loop runs while i <= 5
while (i <= 5) {
    sum += i;     // same as: sum = sum + i
    i++;          // increment i by 1
}

console.log("Sum from 1 to 5:", sum); // Output: 15


// =======================================
// 2. while loop – countdown from 5 to 0
// =======================================

let countdown = [];  // empty array to store numbers
let j = 5;           // start from 5

while (j >= 0) {     // loop until j is 0
    countdown.push(j);
    j--;             // decrease j by 1
}

console.log("Countdown array:", countdown); // Output: [5, 4, 3, 2, 1, 0]


// ===================================================
// 3. do...while loop – take input until user types "Stop"
//    (Works only in browser because of prompt())
// ===================================================

let teacollection = [];  // array to store user inputs
let tea;                 // variable to hold each input

do {
    tea = prompt("Enter something (type 'Stop' to finish): "); // browser-only

    // Only add to array if input is NOT "Stop"
    if (tea !== "Stop") {
        teacollection.push(tea);
    }

} while (tea !== "Stop");  // loop stops when user types "Stop"

console.log("Tea collection (user input):", teacollection);


// ==========================================
// 4. do...while loop – sum from 1 to 3
// ==========================================

let total = 0;   // start total at 0
let k = 1;       // start k at 1

do {
    total += k;  // add k to total
    k++;         // increment k
} while (k <= 3); // loop continues while k <= 3

console.log("Total from 1 to 3:", total); // Output: 6


// ======================================================
// 5. for loop – multiply each number in array by 2
// ======================================================

let numbersArray = [2, 4, 6];  // original array
let multipliednumber = [];     // to store results
let n = numbersArray.length;   // length of array

for (let i = 0; i < n; i++) {
    let mul = numbersArray[i] * 2;   // multiply each element by 2
    multipliednumber.push(mul);      // push result into new array
}

console.log("Numbers multiplied by 2:", multipliednumber); // Output: [4, 8, 12]


// ====================================================================
// 6. for loop – copy city names into another array using push()
// ====================================================================

let cityArray = ["PARIS", "NEW YORK", "TOKYO", "LONDON"];  // original array
let city_list = [];                                        // new array

for (let i = 0; i < cityArray.length; i++) {
    city_list.push(cityArray[i]);  // copy each element
}

console.log("City list:", city_list);
// Output: ["PARIS", "NEW YORK", "TOKYO", "LONDON"]


// =======================================================================
// 7. for loop + break – stop when we find "Chai"
// =======================================================================

let teaArray = ["green tea", "black tea", "Chai", "oolong tea"];
let selectedtea = [];

for (let i = 0; i < teaArray.length; i++) {
    if (teaArray[i] === "Chai") {
        // when "Chai" is found, exit the loop
        break;
    }
    selectedtea.push(teaArray[i]); // add teas before "Chai"
}

console.log("Selected teas before 'Chai':", selectedtea);
// Output: ["green tea", "black tea"]


// =======================================================================
// 8. for loop + continue – skip "Paris" but add all other cities
// =======================================================================

let citiesArray = ["London", "New York", "Paris", "Berlin"];
let visitedcities = [];

for (let i = 0; i < citiesArray.length; i++) {
    if (citiesArray[i] === "Paris") {
        // skip "Paris" and move to next iteration
        continue;
    }
    visitedcities.push(citiesArray[i]); // add other cities
}

console.log("Visited cities (skipping Paris):", visitedcities);
// Output: ["London", "New York", "Berlin"]


// =======================================================================
// 9. for...of + break – collect numbers until we reach 4
// =======================================================================

let numbers = [1, 2, 3, 4, 5];
let smallnumbers = [];

for (const num of numbers) {
    if (num === 4) {
        // stop loop when number is 4
        break;
    }
    smallnumbers.push(num); // add numbers before 4
}

console.log("Numbers before 4:", smallnumbers);
// Output: [1, 2, 3]


// =======================================================================
// 10. for...of + continue – skip "herbal tea"
// =======================================================================

let teas = ["chai", "green tea", "herbal tea", "black tea"];
let preferedtea = [];

for (const teaItem of teas) {
    if (teaItem === "herbal tea") {
        // skip "herbal tea"
        continue;
    }
    preferedtea.push(teaItem);
}

console.log("Preferred teas (skipping herbal tea):", preferedtea);
// Output: ["chai", "green tea", "black tea"]


let citiespopulation = {
    London: 8353843948,
    Amsterdam: 7868348894,
    Mumbai: 98689889686,
    Ahmedabad: 968775887588,
    Meghalaya: 688768787,
    Pune: 87687668798,
};

// Object to store final values (optional)
let citypopulation = {};

console.log("Population values:", Object.values(citiespopulation));

// Loop through object using for...in
for (const key in citiespopulation) {
    if (Object.prototype.hasOwnProperty.call(citiespopulation, key)) {
        const population = citiespopulation[key];
        citypopulation[key] = population; // storing in new object
    }
}

console.log("Copied city population object:", citypopulation);
