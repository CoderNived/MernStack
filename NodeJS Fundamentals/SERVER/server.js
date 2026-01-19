const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const server = http.createServer((req, res) => {
    console.log(`Request for ${req.url} received.`);

    const filepath = path.join(
        __dirname,
        req.url === '/' ? 'index.html' : req.url
    );

    const extName = path.extname(filepath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
    };

    const contentType = mimeTypes[extName] || 'application/octet-stream';

    fs.readFile(filepath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server is Listening on port ${port}`);
});
