// your code goes here
let computer = {cpu: 12};
let lenovo  = {
    __proto__: computer,
    screen:"HD",};
let tomHardware = {};

// console.log('computer', computer.__proto__);
// console.log('lenovo', lenovo.__proto__)

let genericar = {tyres: 4}
let tesla = {
    drivers: "AI"
}
Object.setPrototypeOf(tesla, genericar);
console.log('tesla', tesla.tyres);