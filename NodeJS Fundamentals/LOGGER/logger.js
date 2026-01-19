const fs = require('fs');
const os = require('os');
const path = require('path');

const EventEmitter = require('events');
class Logger extends EventEmitter {
    log(messages){
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${messages}${os.EOL}`;
        console.log(logMessage);
    }
}
const logger = new Logger();