// SPDX-License-Identifier: Unlicense

// Only problem here from correction -> put a factor * 1000 in order to have decimals

pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

error ExistingTeacher(string _msg);
error WrongGraduation(string _msg);
error WrongSubject(string _msg);

contract GradeClass is Ownable {

    struct Student {
        string name;
        uint256 gradeBiology;
        uint256 gradeMaths;
        uint256 gradeFr;
    }

    struct Teacher {
        bool defined;
        string name;
    }

    mapping (uint256 => Student) private students;
    mapping (address => Teacher) private teachers;
    uint256 private nbStudents;
    uint256 private avgBiology;
    uint256 private avgMaths;
    uint256 private avgFr;

    constructor() Ownable(msg.sender) {
        addTeacher(msg.sender, "Henri D\u00E9tour\u00E9");
    }

    function addStudent(string memory _name) external {
        students[nbStudents].name = _name;
        nbStudents++;
    }

    function setGrades(uint256 _studentIndex, uint256 _gradeBiology, uint256 _gradeMaths, uint256 _gradeFr) external {
        if (_gradeBiology > 20 || _gradeMaths > 20 || _gradeFr > 20) {
            revert WrongGraduation("Grades must be out of 20.");
        }
        students[_studentIndex].gradeBiology = _gradeBiology;
        students[_studentIndex].gradeMaths = _gradeMaths;
        students[_studentIndex].gradeFr = _gradeFr;
        computeAvgs();
    }

    function addTeacher(address _address, string memory _name) public onlyOwner {
        if(teachers[_address].defined) {
            revert ExistingTeacher("Teacher already defined.");
        }
        teachers[_address].name = _name;
        teachers[_address].defined = true;
    }

    function getAvgForSubject(string memory _subject) external view returns(uint256) {
        if(compareStrings(_subject, "biology")) {
            return avgBiology;
        } else if(compareStrings(_subject, "french")) {
            return avgFr;
        } else if(compareStrings(_subject, "maths")) {
            return avgMaths;
        } else {
            revert WrongSubject("Subject malformated");
        }
    }

    function getGrades(uint256 studentIndex) external view returns(Student memory) {
        return students[studentIndex];
    }

    function validatedYear(uint256 studentIndex) external view returns(bool) {
        return ((students[studentIndex].gradeBiology + students[studentIndex].gradeMaths + students[studentIndex].gradeFr) / 3) >= 10;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function computeAvgs() private {
        uint256 sumBio;
        uint256 sumFr;
        uint256 sumMaths;
        for (uint256 i=0; i<nbStudents; i++) {
            sumBio += students[i].gradeBiology;
            sumFr += students[i].gradeFr;
            sumMaths += students[i].gradeMaths;
        }
        avgBiology = sumBio / nbStudents;
        avgFr = sumFr / nbStudents;
        avgMaths = sumMaths / nbStudents;
    }
}