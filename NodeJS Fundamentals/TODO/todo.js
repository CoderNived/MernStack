const fs = require('fs');
const filepath = './tasks.json';

const command = process.argv[2];
const argument = process.argv[3];

const loadTasks =()=>{
    try{
        const dataBuffer=fs.readFileSync(filepath);
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    }catch(error){
        return [];
    }
}
const addTask = (task)=> {
    const tasks = loadTasks();
    tasks.push({ task });
    saveTasks(tasks);
}

const listTasks =()=>{
    const tasks = loadTasks();
    tasks.forEach((task,index)=> console.log(`${index + 1}. ${task.task}`));
}

const saveTasks=(tasks)=>{
    const dataJSON = JSON.stringify(tasks);
    fs.writeFileSync(filepath,dataJSON);
    console.log("Task added!", tasks);
}

if (command == 'add'){
    addTask(argument)
} else if (command == "list"){
    listTasks();
}else if (command == "remove"){
    removeTask(parseInt(argument));
}else{
    console.log("Command not found!")
}