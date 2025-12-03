// Create a function that takes an array of objects as inputs, and returns the users whose age>18 and are male
function getUsers(Users) {
    let result = [];
    for (let i = 0; i < Users.length; i++) {
      if (Users[i].age > 18 && Users[i].gender === "male") {
        result.push(Users[i].name);
      }
    }
    return result;
  }
  
  const Users = [
    {
      name: "Harkirat",
      age: 21,
      gender: "male"
    },
    {
      name: "Raman",
      age: 22,
      gender: "male"
    }
  ];
  
  console.log(getUsers(Users));  // Output → ["Harkirat", "Raman"]
  