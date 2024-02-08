// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.15;

contract People {
    struct Person {
        string name;
        uint age;
    }

    Person public person;
    Person[] public persons;

    function modifyPerson(string memory _name, uint _age) public {
        person = Person({
            age: _age,
            name: _name
        });
    }

    function addPerson(string memory _name, uint _age) public {
        persons.push(Person({
            age: _age,
            name: _name
        }));
    }

    function removePerson() public {
        persons.pop();
    }
}