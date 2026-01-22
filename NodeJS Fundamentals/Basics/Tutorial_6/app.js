const fs=require('fs');

const readStream=fs.createReadStream('./example.txt','utf-8');
const writeStream=fs.createWriteStream('example2.txt')
readStream.on('data',(chunk)=>{
    writeStream.write(chunk)
});
