function greet(name){
    console.log(`Hello ${name} !!!`);
}
greet("Nived");

function maketea(typeoftea){
    console.log(`Making ${typeoftea}`)
}
maketea("Green Tea")

function orderTea(teaType) {
    function confirmOrder() {
        return `Order confirmed for ${teaType}`;
    }
    return confirmOrder();
}

let orderConfirmation = orderTea("chai");
console.log(orderConfirmation);


// Function expression using arrow function
const greet = () => {
    console.log("Hello!");
};

const calculateTotal = (price, quantity) => price * quantity;

let totalCost = calculateTotal(100, 100);

console.log(totalCost); // 10000
greet();                // "Hello!"

