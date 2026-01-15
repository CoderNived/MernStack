// 1️⃣ Problem: Access the first item from an array of tea flavors.
let teaFlavors = ['green tea', 'black tea', 'oolong tea'];
const firsttea = teaFlavors[0];


// 2️⃣ Problem: Access your favorite city from the list of cities.
let cities = ['London', "tokyo", "Paris", "New York"];
const favoritecity = cities[2];


// 3️⃣ Problem: Store different types of tea in an array.
let teatype = ['herbal tea', 'white tea', 'masala chai'];


// 4️⃣ Problem: Remove the first visited city and add 'Berlin' to the list.
let citivisited = ["Mumabi", "Sydney"];
citivisited.shift();
citivisited.push('Berlin');
console.log(citivisited);


// 5️⃣ Problem: Remove the last tea order and then print remaining orders.
let teaorders = ["chai", 'ice tea', 'matcha', 'earl grey'];
teaorders.pop();
console.log(teaorders);


// 6️⃣ Problem: Create a soft copy of the tea list (both refer to same memory).
let popularteas = ['greentea', 'oolong tea', 'chai'];
let softcopyteas = popularteas;
console.log(softcopyteas);
console.log(popularteas);


// 7️⃣ Problem: Create a hard copy of an array so the original and copy do not affect each other.
let topcities = ['Berlin', 'Singapore', 'NewYork'];
let hardcopies = [...topcities];
topcities.pop();
console.log(hardcopies);


// 8️⃣ Problem: Create a hard copy using slice() method.
let hardcopiescities = topcities.slice();


// 9️⃣ Problem: Combine two city lists into one using concat().
let europeancities = ['Paris', 'Rome'];
let asiancities = ['Tokyo', 'Seoul'];
let worldcities = europeancities.concat(asiancities);
console.log(worldcities);


// 🔟 Problem: Find the length of the menu array.
let teamenu = ['chai', 'latte', 'cappuccino', 'espresso']; // menu array added
let menulength = teamenu.length;
console.log(menulength);


// 1️⃣1️⃣ Problem: Check if 'London' is present in the bucket list.
let citybucketlist = ['Kyoto', 'London', 'Vancouver'];
let isLondonInList = citybucketlist.includes('London');
console.log(isLondonInList);


// =============================
// arrays_practice.js
// Problems + Solutions for Array Concepts in JavaScript
// =============================

// ---------------------------------------
// 1. Create an array and access elements
// ---------------------------------------
// Problem: Create an array of fruits and log the first and last fruit.

let fruits = ["apple", "banana", "mango", "orange"];
console.log("1) First fruit:", fruits[0]);
console.log("1) Last fruit:", fruits[fruits.length - 1]);

// ---------------------------------------
// 2. Find the length of an array
// ---------------------------------------
// Problem: Print how many fruits are in the array.

console.log("2) Number of fruits:", fruits.length);

// ---------------------------------------
// 3. Add elements to the end using push()
// ---------------------------------------
// Problem: Add "grapes" and "kiwi" to the end of fruits array.

fruits.push("grapes");
fruits.push("kiwi");
console.log("3) After push:", fruits);

// ---------------------------------------
// 4. Remove the last element using pop()
// ---------------------------------------
// Problem: Remove the last fruit from the array and print it.

let removedFruit = fruits.pop();
console.log("4) Removed fruit (pop):", removedFruit);
console.log("4) Fruits after pop:", fruits);

// ---------------------------------------
// 5. Add elements to the beginning using unshift()
// ---------------------------------------
// Problem: Add "papaya" at the beginning of the fruits array.

fruits.unshift("papaya");
console.log("5) After unshift:", fruits);

// ---------------------------------------
// 6. Remove first element using shift()
// ---------------------------------------
// Problem: Remove the first fruit and print the updated array.

let shiftedFruit = fruits.shift();
console.log("6) Removed fruit (shift):", shiftedFruit);
console.log("6) Fruits after shift:", fruits);

// ---------------------------------------
// 7. Check if an element exists using includes()
// ---------------------------------------
// Problem: Check if "banana" is present in the fruits array.

let hasBanana = fruits.includes("banana");
console.log("7) Is 'banana' in fruits?", hasBanana);

// ---------------------------------------
// 8. Find index of element using indexOf()
// ---------------------------------------
// Problem: Find index of "mango" in the array.

let mangoIndex = fruits.indexOf("mango");
console.log("8) Index of 'mango':", mangoIndex);

// ---------------------------------------
// 9. Join two arrays using concat()
// ---------------------------------------
// Problem: Join europeanCities and asianCities into worldCities.

let europeanCities = ["Paris", "Berlin", "Rome"];
let asianCities = ["Tokyo", "Seoul", "Bangkok"];

let worldCities = europeanCities.concat(asianCities);
console.log("9) World cities:", worldCities);

// ---------------------------------------
// 10. Extract part of array using slice()
// ---------------------------------------
// Problem: Get the first 2 world cities without modifying original array.

let firstTwoWorldCities = worldCities.slice(0, 2);
console.log("10) First two world cities (slice):", firstTwoWorldCities);
console.log("10) Original world cities:", worldCities);

// ---------------------------------------
// 11. Modify array using splice()
// ---------------------------------------
// Problem A: Remove 2 cities starting from index 1.
// Problem B: Insert a city at index 2.

let citiesSpliceExample = ["London", "New York", "Dubai", "Sydney", "Mumbai"];

// A: remove 2 cities starting from index 1
let removedCities = citiesSpliceExample.splice(1, 2);
console.log("11A) Removed cities (splice):", removedCities);
console.log("11A) After removing:", citiesSpliceExample);

// B: insert "Tokyo" at index 2 (0-based)
citiesSpliceExample.splice(2, 0, "Tokyo");
console.log("11B) After inserting Tokyo:", citiesSpliceExample);

// ---------------------------------------
// 12. Reverse an array using reverse()
// ---------------------------------------
// Problem: Reverse the order of numbers.

let numbers = [1, 2, 3, 4, 5];
numbers.reverse();
console.log("12) Reversed numbers:", numbers);

// ---------------------------------------
// 13. Sort an array (basic) using sort()
// ---------------------------------------
// Problem: Sort an array of names alphabetically.

let names = ["Harkirat", "Raman", "Aisha", "Zoya", "Kunal"];
names.sort();
console.log("13) Sorted names:", names);

// ---------------------------------------
// 14. Sort numbers with custom compare function
// ---------------------------------------
// Problem: Sort numbers in ascending and descending order.

let randomNumbers = [10, 3, 25, 7, 1, 100];

let ascending = [...randomNumbers].sort((a, b) => a - b);
let descending = [...randomNumbers].sort((a, b) => b - a);

console.log("14) Ascending numbers:", ascending);
console.log("14) Descending numbers:", descending);

// ---------------------------------------
// 15. Loop through array using for loop
// ---------------------------------------
// Problem: Print each city from worldCities with its index.

for (let i = 0; i < worldCities.length; i++) {
    console.log(`15) City at index ${i}:`, worldCities[i]);
}

// ---------------------------------------
// 16. Loop through array using forEach()
// ---------------------------------------
// Problem: Print each fruit in uppercase using forEach.

fruits.forEach(function (fruit) {
    console.log("16) Fruit (forEach):", fruit.toUpperCase());
});

// ---------------------------------------
// 17. Transform array using map()
// ---------------------------------------
// Problem: Create a new array containing the length of each fruit name.

let fruitNameLengths = fruits.map(function (fruit) {
    return fruit.length;
});
console.log("17) Length of each fruit name:", fruitNameLengths);

// ---------------------------------------
// 18. Filter array using filter()
// ---------------------------------------
// Problem: From numbers, get only even numbers.

let numList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let evenNumbers = numList.filter(function (num) {
    return num % 2 === 0;
});
console.log("18) Even numbers (filter):", evenNumbers);

// ---------------------------------------
// 19. Find first match using find()
// ---------------------------------------
// Problem: Find the first number greater than 50 in an array.

let scores = [10, 35, 47, 55, 60, 42];

let firstGreaterThan50 = scores.find(function (score) {
    return score > 50;
});
console.log("19) First score > 50 (find):", firstGreaterThan50);

// ---------------------------------------
// 20. Check conditions using some() and every()
// ---------------------------------------
// Problem A: Check if there is at least one failing score (< 40).
// Problem B: Check if all scores are above 30.

let hasFail = scores.some(function (score) {
    return score < 40;
});
let allAbove30 = scores.every(function (score) {
    return score > 30;
});

console.log("20A) Is there any failing score (<40)?", hasFail);
console.log("20B) Are all scores > 30?", allAbove30);

// ---------------------------------------
// 21. Copying arrays: soft copy vs hard copy
// ---------------------------------------
// Problem: Show difference between reference copy and real copy.

let originalCities = ["Delhi", "Goa", "Pune"];

// Soft copy (both point to same array)
let softCopyCities = originalCities;
softCopyCities.push("Jaipur");

console.log("21) Original after soft copy change:", originalCities);
console.log("21) Soft copy:", softCopyCities);

// Hard copy using spread operator
let hardCopyCities = [...originalCities];
hardCopyCities.pop();

console.log("21) Original after hard copy change:", originalCities);
console.log("21) Hard copy:", hardCopyCities);

// ---------------------------------------
// 22. Nested arrays (arrays inside arrays)
// ---------------------------------------
// Problem: Represent 2D coordinates and access specific value.

let coordinates = [
    [10, 20],
    [30, 40],
    [50, 60]
];

console.log("22) Second coordinate pair:", coordinates[1]);
console.log("22) X of third coordinate:", coordinates[2][0]);

// ---------------------------------------
// 23. Array of objects + map/filter
// ---------------------------------------
// Problem A: Get names of all users.
// Problem B: Get users who are adults (age >= 18).

let users = [
    { name: "Aman", age: 17 },
    { name: "Sara", age: 21 },
    { name: "Karan", age: 19 },
    { name: "Mia", age: 16 }
];

// A: get all names
let userNames = users.map(function (user) {
    return user.name;
});
console.log("23A) User names:", userNames);

// B: get only adults
let adultUsers = users.filter(function (user) {
    return user.age >= 18;
});
console.log("23B) Adult users:", adultUsers);

// ---------------------------------------
// 24. Sum values using reduce()
// ---------------------------------------
// Problem: Find the total of all scores using reduce.

let totalScore = scores.reduce(function (accumulator, current) {
    return accumulator + current;
}, 0);

console.log("24) Total score (reduce):", totalScore);

// ---------------------------------------
// 25. Practice: Custom problem using many methods together
// ---------------------------------------
// Problem: From an array of tea orders, 
// - remove invalid orders (null or empty string)
// - convert all to lowercase
// - count how many "chai" orders are there.

let teaOrders = ["Chai", "Latte", "", null, "CHAI", "Mocha", "chai"];

let cleanedTeaOrders = teaOrders
    .filter(function (item) {
        return item && item.trim() !== "";
    })
    .map(function (item) {
        return item.toLowerCase();
    });

let chaiCount = cleanedTeaOrders.filter(function (item) {
    return item === "chai";
}).length;

console.log("25) Cleaned tea orders:", cleanedTeaOrders);
console.log("25) Number of 'chai' orders:", chaiCount);

// =============================
// END OF FILE
// =============================
