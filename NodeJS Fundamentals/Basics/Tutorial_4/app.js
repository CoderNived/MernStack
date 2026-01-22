const fs = require('fs');
fs.writeFile("text.txt","this is an example",(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("File successfully created");
        fs.readFile('text.txt','utf-8',(err,file)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log(file);
            }
        })
    }
});

fs.rename('text.txt','example.txt',(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("file was successfully renamed");
    }
});

fs.appendFile('example.txt','this just an example file',(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("file updated");
    }
});

fs.unlink("example.txt",(err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("file successfully deleted");
    }
})