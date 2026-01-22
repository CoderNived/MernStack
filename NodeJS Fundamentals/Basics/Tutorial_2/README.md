📘 Node.js EventEmitter Tutorial (Complete Notes)

This tutorial explains how events work in Node.js using the built-in EventEmitter class, including:

Creating custom events

Passing arguments with events

Using EventEmitter inside classes

Real-world patterns

📂 Project Overview

This project demonstrates:

Basic EventEmitter usage

Custom events with parameters

Class-based event emitters

Getter & setter triggering events

🚀 Full Source Code
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

eventEmitter.on('tutorial', (num1, num2) => {
    console.log("Tutorial event has occured");
    console.log(num1 + num2);
});

eventEmitter.emit('tutorial', 1, 2);

class Person extends EventEmitter {
    constructor(name) {
        super();
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        this._name = newName;
        this.emit('name');
    }
}

let pedro = new Person('pedro');

pedro.on('name', () => {
    console.log(`hello ${pedro.name}`);
});

pedro.emit('name');
pedro.name = 'Pedro';

let cristina = new Person('cristina');
cristina.on('name', () => {
    console.log(`hello ${cristina.name}`);
});
cristina.emit('name');

🧠 Core Concepts Explained
1️⃣ What is EventEmitter?

EventEmitter is a core Node.js module

Used to create, listen, and respond to custom events

Foundation of many Node.js features:

Streams

HTTP servers

File system events

const EventEmitter = require('events');

2️⃣ Creating an EventEmitter Instance
const eventEmitter = new EventEmitter();


Creates a new event handler object

Can:

Register listeners

Emit events

Pass data with events

3️⃣ Listening to Events (.on())
eventEmitter.on('tutorial', (num1, num2) => {
    console.log("Tutorial event has occured");
    console.log(num1 + num2);
});

🔍 Explanation

'tutorial' → event name

Callback runs when the event is emitted

Can accept multiple parameters

4️⃣ Emitting Events (.emit())
eventEmitter.emit('tutorial', 1, 2);


Triggers the 'tutorial' event

Arguments (1, 2) are passed to the listener

Output:

Tutorial event has occured
3

5️⃣ Passing Data Through Events
.emit('eventName', arg1, arg2, arg3);


Any number of arguments can be passed

Used for:

Notifications

Data transfer

Async workflows

6️⃣ EventEmitter with Classes (IMPORTANT)
class Person extends EventEmitter {
    constructor(name) {
        super();
        this._name = name;
    }
}

Why super() is required?

Initializes EventEmitter

Without it → ❌ runtime error

Enables .on() and .emit() inside the class

7️⃣ Getters and Setters with Events
get name() {
    return this._name;
}

set name(newName) {
    this._name = newName;
    this.emit('name');
}

🔥 Key Idea

Changing data triggers an event

Very useful in:

Observers

State management

Real-time systems

8️⃣ Creating Object-Specific Events
let pedro = new Person('pedro');

pedro.on('name', () => {
    console.log(`hello ${pedro.name}`);
});


Each object has its own event system

Events are instance-specific, not global

9️⃣ Triggering Events Manually vs Automatically
Manual Trigger
pedro.emit('name');

Automatic Trigger
pedro.name = 'Pedro';


Setter automatically emits the event

Cleaner and safer design

🔁 Multiple Instances Example
let cristina = new Person('cristina');

cristina.on('name', () => {
    console.log(`hello ${cristina.name}`);
});

cristina.emit('name');

Output:
hello pedro
hello Pedro
hello cristina

🧪 Execution Flow Summary

Event listener is registered

Event is emitted

Callback function executes

Data flows through arguments

⚠️ Common Mistakes
Mistake	Why Wrong
Forgetting super()	EventEmitter won’t work
Using variables instead of strings	Event names must be strings
Emitting before .on()	Listener won’t run
Using same emitter for all objects	Causes bugs
📌 Best Practices

Use clear event names

Keep event logic lightweight

Prefer automatic emit via setters

Avoid deep event chains

One responsibility per event

🌍 Real-World Use Cases

Chat applications

Logging systems

File upload progress

Notification systems

Microservices communication

🎯 Key Takeaways

EventEmitter enables event-driven programming

.on() listens, .emit() triggers

Events can carry data

Classes can emit their own events

Core concept behind Node.js internals

🚀 Next Topics to Learn

.once() vs .on()

Removing listeners (.removeListener)

Async events

Streams & EventEmitter

Observer design pattern