const fs = require('fs');
fs.mkdir('tutorial1',(err)=>{
    if(err){
        console.log(err);
    }
    else{
        fs.rmdir('tutorial1',(err)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log("Folder successfully deleted");
            }
        });
        console.log("Folder successfully created");
    }
})