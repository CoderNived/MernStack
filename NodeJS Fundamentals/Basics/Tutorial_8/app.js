// Import the built-in http module
const http = require('http');

// Create the server
const server = http.createServer((req, res) => {

    // Set response header
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    // Send response
    res.write("Hello World from Node.js");

    // End the response
    res.end();
});

// Define the port
const PORT = 3000;

// Start listening
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
