// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
    Comment: I did not use require since Ben BK
    told us it is no longer the best practice because
    revert can save gas vs. require.
*/
error VoterAlreadyRegistered(string _msg, address _voterAddr);
error NotTheRightPhase(string _msg);
error OnlyVotersAndOwner(string _msg);
error AlreadyVoted(string _msg);
error VotersLeft(string _msg);
error VoteIsOver(string _msg);
error ProposalDoesNotExit(string _msg);
error NoVotersYet(string _msg);
error NoProposalsYet(string _msg);

contract Voting is Ownable {

    mapping(address => Voter) private voters;

    // Comment: Below variable is to get winner voter (i.e proposer)
    mapping(uint => address) private proposalsProposers;

    /*
        Comment: Below state variable is just to "cast"
        WorfklowStatus from int to string in order to display
        them with getCurrentWorkflowStatus (debugging purpose)
        this should be done by frontend in real life I guess.
        I instanciated it in the constructor.
    */
    mapping(WorkflowStatus => string) private wfStatusToString;

    Proposal[] private proposals;

    // Comment: Below variable is just for debugging purposes (getter: getVotersAddress)
    address[] private votersAddress;

    /*
        Comment: these below are used to check if there are
        still voters left to vote during VotingSessionStarted
        phase.
    */
    uint private nbVoters;
    uint private nbVotes;

    uint private winningProposalId;

    WorkflowStatus private currentWFStatus;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    /*
        Comment: I don't understand why I cannot use
        calldata for _callingFunction, remix throws an
        error when calling the modifier in the functions.
        Perhaps because I modify _callingFunction in
        compareStrings with keccak256 and abi.encodePacked ?
    */
    modifier adequateWFStatus(string memory _callingFunction) {
        if(
            (compareStrings(_callingFunction, "registerVoter") && currentWFStatus != WorkflowStatus.RegisteringVoters) ||
            (compareStrings(_callingFunction, "submitProposal") && currentWFStatus != WorkflowStatus.ProposalsRegistrationStarted) ||
            (compareStrings(_callingFunction, "getProposals") && currentWFStatus == WorkflowStatus.RegisteringVoters) ||
            (compareStrings(_callingFunction, "submitVote") && currentWFStatus != WorkflowStatus.VotingSessionStarted) ||
            (compareStrings(_callingFunction, "getWinningData") && currentWFStatus != WorkflowStatus.VotesTallied)
        ) {
            revert NotTheRightPhase("Current phase does not allow performing this action.");
        }
        _;
    }

    /*
        Comment: I decided to whitelist
        owner for convenience. ¯\_(ツ)_/¯
    */
    modifier onlyVoters() {
        if(msg.sender != owner() && !voters[msg.sender].isRegistered) {
            revert OnlyVotersAndOwner("Only registered voters and owner can perform this action.");
        }
        _;
    }

    constructor() Ownable(msg.sender) {
        wfStatusToString[WorkflowStatus.RegisteringVoters] = "RegisteringVoters";
        wfStatusToString[WorkflowStatus.ProposalsRegistrationStarted] = "ProposalsRegistrationStarted";
        wfStatusToString[WorkflowStatus.ProposalsRegistrationEnded] = "ProposalsRegistrationEnded";
        wfStatusToString[WorkflowStatus.VotingSessionStarted] = "VotingSessionStarted";
        wfStatusToString[WorkflowStatus.VotingSessionEnded] = "VotingSessionEnded";
        wfStatusToString[WorkflowStatus.VotesTallied] = "VotesTallied";
    }

    //################################ GETTERS

    function getCurrentWorkflowStatus() external view onlyVoters returns (string memory) {
        return wfStatusToString[currentWFStatus];
    }

    /*
        Comment: Refering to this part of the subject:
        "Chaque électeur peut voir les votes des autres".
        I did not implement a "getVotes" function since voters
        can get votes count for each proposal through below function
        "getProposals". Also we have not a struct Vote.
        Also they can see votes through the events.
    */
    function getProposals() external view onlyVoters adequateWFStatus("getProposals") returns(Proposal[] memory) {
        return proposals;
    }

    /*
        Comment: below is just for debugging purpose, it is
        convenient to be able to see all voters address.
    */
    function getVotersAddress() external view onlyVoters returns(address[] memory) {
        return votersAddress;
    }

    /*
        Comment: I think a better solution would have been to declare
        proposerAddress in Proposal struct and do something like :
        voters[winningProposal.proposerAddress]
        But during Q&A with Ben BK about the subject
        it was told that we could not modify the given structs.
    */
    function getWinner() external view onlyVoters adequateWFStatus("getWinningData") returns(Voter memory) {
        return voters[proposalsProposers[winningProposalId]];
    }

    function getWinningProposal() external view onlyVoters adequateWFStatus("getWinningData") returns(Proposal memory) {
        return proposals[winningProposalId];
    }

    //################################ SETTERS

    function registerVoter(address _address) external onlyOwner adequateWFStatus("registerVoter") {
        if (voters[_address].isRegistered) {
            revert VoterAlreadyRegistered("Voter already registered.", _address);
        }
        voters[_address] = Voter({
            isRegistered: true,
            hasVoted: false,
            votedProposalId: 0
        });
        nbVoters++;
        votersAddress.push(msg.sender);
        emit VoterRegistered(_address);
    }

    function setNextPhase() external onlyOwner {
        if(nbVotes < nbVoters && currentWFStatus == WorkflowStatus.VotingSessionStarted ) {
            revert VotersLeft("One or more voters did not vote. If you still want to set next phase, call forceNextPhase.");
        }
        forceNextPhase();
    }

    /*
        Comment: Force next phase can be used to bypass
        validation if a voter did not vote yet but we
        cannot wait for him). It is public since it is
        used by setNextPhase and owner.
    */
    function forceNextPhase() public onlyOwner {
        canMoveToNextPhase();
        WorkflowStatus[2] memory statusChange = incrementWFStatus();
        if(currentWFStatus == WorkflowStatus.VotesTallied) {
            setWinningProposal();
        }
        emit WorkflowStatusChange(statusChange[0], statusChange[1]);
    }

    function incrementWFStatus() private returns(WorkflowStatus[2] memory) {
        WorkflowStatus previousStatus = currentWFStatus;
        currentWFStatus = WorkflowStatus(uint(currentWFStatus) + 1);
        return [previousStatus, currentWFStatus];
    }

    function submitProposal(string calldata _description) external onlyVoters adequateWFStatus("submitProposal") {
        proposals.push(
            Proposal({
                description: _description,
                voteCount: 0
            })
        );
        proposalsProposers[proposals.length -1] = msg.sender;
        emit ProposalRegistered(proposals.length -1);
    }

    function submitVote(uint _proposalId) external onlyVoters adequateWFStatus("submitVote") {
        if(voters[msg.sender].hasVoted) {
            revert AlreadyVoted("Cannot vote twice.");
        }
        if(_proposalId >= proposals.length) {
            revert ProposalDoesNotExit("Proposal with given id does not exist");
        }
        proposals[_proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;
        nbVotes++;
        emit Voted(msg.sender, _proposalId);
    }

    /*
        Comment: deliberately not implemented the
        tied situations for this version.
    */
    function setWinningProposal() private {
        uint maxVoteCount = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVoteCount) {
                maxVoteCount = proposals[i].voteCount;
                winningProposalId = i;
            }
        }
    }

    //######## CHECKERS

    /*
        Comment: Perhaps I should have left this
        inside calling function to save gas ? I think
        Ben BK told that calling a function from another
        costs a lot.
    */
    function canMoveToNextPhase() private view {
        if(nbVoters == 0) {
            revert NoVotersYet("Must at least have one voter to proceed.");
        }
        if(proposals.length == 0 && currentWFStatus != WorkflowStatus.RegisteringVoters) {
            revert NoProposalsYet("Must at least have one proposal to proceed.");
        }
        if(currentWFStatus == WorkflowStatus.VotesTallied) {
            revert VoteIsOver("Vote is finished now, you can go home or ask coder to implement restartVote");
        }
    }

    //######## UTILS

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
