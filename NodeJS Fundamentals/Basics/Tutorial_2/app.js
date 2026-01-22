const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

eventEmitter.on('tutorial',(num1,num2)=>{
    console.log("Tutorial event has occured");
    console.log(num1 + num2);
});

eventEmitter.emit('tutorial',1,2);

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
        this.emit('name'); // emit event when name changes
    }
}

let pedro = new Person('pedro');

pedro.on('name', () => {
    console.log(`hello ${pedro.name}`);
});

// trigger the event
pedro.emit('name');      // OR
pedro.name = 'Pedro';    // triggers automatically via setter

let cristina = new Person('cristina');
cristina.on('name',()=>{
    console.log(`hello ${cristina.name}`);
})
cristina.emit('name');
