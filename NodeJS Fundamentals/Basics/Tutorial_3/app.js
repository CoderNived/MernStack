const readline = require("readline");
const rl=readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let num1 = Math.floor((Math.random()*10)+1);
let num2 = Math.floor((Math.random()*10)+1);
let answer = num1 + num2;

rl.question(`What is ${num1}+${num2} ?`,(userInput) => {
    if(userInput.trim()==answer){
        console.log("correct answer!!");
        rl.close();
    }
    else{
        console.log("Incorrect answer");
        rl.prompt();
        rl.on('line',(userInput)=>{
            if(userInput.trim()==answer){
                console.log("Correct answer!!")
                rl.close();
            }
            else{
                rl.setPrompt("Your answer is wrong")
            }
        });
    }
});


