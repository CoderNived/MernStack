const fs= require('fs');
const zlib= require('zlib');
const gzip = zlib.createGzip();
const readStream = fs.createReadStream('.txt','utf-8');
const writeStream = fs. createWriteStream('.txt');
readStream.pipe(gzip).pipe(writeStream);


