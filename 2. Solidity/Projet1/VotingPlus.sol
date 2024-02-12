// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
    Please check ReadmeVotingPlus.md for the description of what I added in this version
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
error WrongVoteMode(string _msg);
error WrongTieMode(string _msg);
error MustSettupVote(string _msg);
error TooMuchPreferences(string _msg);
error PreferencesMustBeUnique(string _msg);
error ErrorWhileResettingVote(string _msg);

contract Voting is Ownable {

    mapping(uint => mapping(address => Voter)) private voters;
    uint private vv; // for "voters versions"
    mapping(uint => address[]) private votersAddress;
    uint private vav; // for "voters address version"
    uint private nbVoters;
    uint private nbVotes;

    mapping(uint => Proposal[]) private proposals;
    uint private pv; // for "proposals version"
    mapping(uint => uint[]) private winningProposalIds;
    uint private wpiv; // for "winning proposal ids version"

    mapping(WorkflowStatus => string) private wfStatusToString;
    WorkflowStatus private currentWFStatus;

    // Possible values should be in "", "simpleVote", "preferentialVote"
    string public voteMode;
    // Possible values should be in "", "keepWinningProposalsOnly", "keepAllProposals", "allowTieSituations"
    string public tieMode;

    // Used for checking if in preferentialVote mode user enters a proposalId multiple times
    mapping(uint => bool) seenValues;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        SettingUpVote,
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    event VotingSetupDone(string mode, string tallyMode);
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event SimpleVoted(address voter, uint proposalId);
    event BlankVoted(address voter);
    event PreferentialVoted(address voter, uint[] proposalIds);

    modifier adequateWFStatus(string memory _callingFunction) {
        if(
            (compareStrings(_callingFunction, "setVotingConditions") && currentWFStatus != WorkflowStatus.SettingUpVote) ||
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

    modifier onlyVoters() {
        if(msg.sender != owner() && !voters[vv][msg.sender].isRegistered) {
            revert OnlyVotersAndOwner("Only registered voters and owner can perform this action.");
        }
        _;
    }

    modifier cannotVoteTwice() {
        if(voters[vv][msg.sender].hasVoted) {
            revert AlreadyVoted("Cannot vote twice.");
        }
        _;
    }

    modifier checkVoteMode(string memory _callingFunction) {
        if(compareStrings(_callingFunction, "simpleVote") && !compareStrings(voteMode, "simpleVote")) {
            revert WrongVoteMode("Wrong vote mode, use submitPreferentialVote instead.");
        }
        if(compareStrings(_callingFunction, "preferentialMode") && !compareStrings(voteMode, "preferentialMode")) {
            revert WrongVoteMode("Wrong vote mode, use submitSimpleVote instead.");
        }
        _;
    }

    constructor() Ownable(msg.sender) {
        wfStatusToString[WorkflowStatus.SettingUpVote] = "SettingUpVote";
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

    function getProposals() external view onlyVoters adequateWFStatus("getProposals") returns(Proposal[] memory) {
        return proposals[pv];
    }

    function getVotersAddress() external view onlyVoters returns(address[] memory) {
        return votersAddress[vav];
    }

    function getWinningProposalIds() external view onlyVoters adequateWFStatus("getWinningData") returns(uint[] memory) {
        return winningProposalIds[wpiv];
    }

    //################################ SETTERS

    function setVoteMode(string calldata _voteMode) external onlyOwner adequateWFStatus("setVotingConditions") {
        if(compareStrings(_voteMode, "simpleVote") || compareStrings(_voteMode, "preferentialVote")) {
            voteMode = _voteMode;
        } else {
            revert WrongVoteMode("Vote mode must be chosen between: 'simpleVote' and 'preferentialVote'");
        }
    }

    function setTieModeVoteMode(string calldata _tieMode) external onlyOwner adequateWFStatus("setVotingConditions") {
        if(
            compareStrings(_tieMode, "keepWinningProposalsOnly") ||
            compareStrings(_tieMode, "keepAllProposals") ||
            compareStrings(_tieMode, "allowTieSituations")
        ){
            tieMode = _tieMode;
        } else {
            revert WrongTieMode("Vote mode must be between: keepWinningProposalsOnly, keepAllProposals and allowTieSituations");
        }
    }

    function registerVoter(address _address) external onlyOwner adequateWFStatus("registerVoter") {
        if(voters[vv][_address].isRegistered) {
            revert VoterAlreadyRegistered("Voter already registered.", _address);
        }
        voters[vv][_address] = Voter({
            isRegistered: true,
            hasVoted: false
        });
        nbVoters++;
        votersAddress[vav].push(msg.sender);
        emit VoterRegistered(_address);
    }

    function setNextPhase() external onlyOwner {
        if(nbVotes < nbVoters && currentWFStatus == WorkflowStatus.VotingSessionStarted ) {
            revert VotersLeft("One or more voters did not vote. If you still want to set next phase, call forceNextPhase.");
        }
        forceNextPhase();
    }

    function forceNextPhase() public onlyOwner {
        canMoveToNextPhase();
        WorkflowStatus[2] memory statusChange = incrementWFStatus();
        if(currentWFStatus == WorkflowStatus.VotesTallied) {
            setWinningProposals();
        }
        emit WorkflowStatusChange(statusChange[0], statusChange[1]);
    }

    function incrementWFStatus() private returns(WorkflowStatus[2] memory) {
        WorkflowStatus previousStatus = currentWFStatus;
        currentWFStatus = WorkflowStatus(uint(currentWFStatus) + 1);
        return [previousStatus, currentWFStatus];
    }

    function submitProposal(string calldata _description) external onlyVoters adequateWFStatus("submitProposal") {
        proposals[pv].push(
            Proposal({
                description: _description,
                voteCount: 0
            })
        );
        emit ProposalRegistered(proposals[pv].length -1);
    }

    function submitSimpleVote(uint _proposalId) external
        onlyVoters
        adequateWFStatus("submitVote")
        cannotVoteTwice()
        checkVoteMode("simpleVote")
    {
        if(_proposalId >= proposals[pv].length) {
            revert ProposalDoesNotExit("Proposal with given id does not exist.");
        }
        proposals[pv][_proposalId].voteCount++;
        voters[vv][msg.sender].hasVoted = true;
        nbVotes++;
        emit SimpleVoted(msg.sender, _proposalId);
    }

    function submitPreferentialVote(uint[] calldata _orderedProposalIds) external
        onlyVoters
        adequateWFStatus("submitVote")
        cannotVoteTwice()
        checkVoteMode("preferentialVote")
    {
        validatePreferencesArray(_orderedProposalIds);

        for(uint i = 0; i < _orderedProposalIds.length; i++) {
            proposals[pv][_orderedProposalIds[i]].voteCount += proposals[pv].length - i;
        }
        voters[vv][msg.sender].hasVoted = true;
        nbVotes++;
        emit PreferentialVoted(msg.sender, _orderedProposalIds);
    }

    function submitBlankVote() external
        onlyVoters
        adequateWFStatus("submitVote")
        cannotVoteTwice()
    {
        voters[vv][msg.sender].hasVoted = true;
        nbVotes++;
        emit BlankVoted(msg.sender);
    }

    function setWinningProposals() private {
        uint maxVoteCount = 0;

        // Get maxVoteCount - can't fill winningProposalIds
        // in this loop since we don't know its size yet and
        // we can't push into non storage arrays ?
        for(uint i = 0; i < proposals[pv].length; i++) {
            if(proposals[pv][i].voteCount > maxVoteCount) {
                maxVoteCount = proposals[pv][i].voteCount;
            }
        }

        for(uint i = 0; i < proposals[pv].length; i++) {
            if(proposals[pv][i].voteCount == maxVoteCount) {
                winningProposalIds[wpiv].push(i);
            }
        }

        if(winningProposalIds[wpiv].length > 1 && !compareStrings(tieMode, "allowTieSituations")) {
            handleTie();
        }
    }

    function handleTie() private {
        if(compareStrings(tieMode, "keepAllProposals")) {
            tiedResetVote("keepAllProposals");
        } else if(compareStrings(tieMode, "keepWinningProposalsOnly")) {
            tiedResetVote("keepWinningProposalsOnly");
        }
    }

    function resetVote(string memory _mode) external onlyOwner {
        WorkflowStatus previousStatus = currentWFStatus;
        if(compareStrings(_mode, "keepNothing")) {
            resetConditionsData();
            resetVotersData();
            resetProposalsData();
            currentWFStatus = WorkflowStatus.SettingUpVote;
            emit WorkflowStatusChange(previousStatus, currentWFStatus);
        } else if(compareStrings(_mode, "keepConditions")) {
            resetVotersData();
            resetProposalsData();
            currentWFStatus = WorkflowStatus.RegisteringVoters;
            emit WorkflowStatusChange(previousStatus, currentWFStatus);
        } else if(compareStrings(_mode, "keepVoters")) {
            resetProposalsData();
            currentWFStatus = WorkflowStatus.ProposalsRegistrationStarted;
            emit WorkflowStatusChange(previousStatus, currentWFStatus);
        } else if(compareStrings(_mode, "keepProposals")) {
            resetVotesData();
            currentWFStatus = WorkflowStatus.VotingSessionStarted;
            emit WorkflowStatusChange(previousStatus, currentWFStatus);
        } else {
            revert ErrorWhileResettingVote("Error while resetting vote, input must be in keepNothing, keepConditions, keepVoters, keepProposals");
        }
    }

    function tiedResetVote(string memory _mode) private {
        WorkflowStatus previousStatus = currentWFStatus;
        if(compareStrings(_mode, "keepWinningProposalsOnly")) {
            pv++;
            for(uint i = 0; i < winningProposalIds[wpiv].length; i++) {
                proposals[pv].push(proposals[pv -1][winningProposalIds[wpiv][i]]);
            }
        }
        wpiv++;
        resetVotesData();
        currentWFStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(previousStatus, currentWFStatus);
    }

    function resetConditionsData() private {
        voteMode = "";
        tieMode = "";
    }

    function resetVotersData() private {
        vv++;
        vav++;
        nbVoters = 0;
        nbVotes = 0;
    }

    function resetProposalsData() private {
        pv++;
        wpiv++;
    }

    function resetVotesData() private {
        for(uint i = 0; i < proposals[pv].length; i++) {
            proposals[pv][i].voteCount = 0;
        }
        for(uint i = 0; i < votersAddress[vav].length; i++) {
            voters[vv][votersAddress[vav][i]].hasVoted = false;
        }
    }

    //################################ CHECKERS

    function canMoveToNextPhase() private view {
        if(currentWFStatus == WorkflowStatus.SettingUpVote && (compareStrings(tieMode, "") || compareStrings(voteMode, ""))) {
            revert MustSettupVote("Must set tie mode and vote mode.");
        }
        if(nbVoters == 0 && currentWFStatus > WorkflowStatus.SettingUpVote) {
            revert NoVotersYet("Must at least have one voter to proceed.");
        }
        if(proposals[pv].length == 0 && currentWFStatus > WorkflowStatus.RegisteringVoters) {
            revert NoProposalsYet("Must at least have one proposal to proceed.");
        }
        if(currentWFStatus == WorkflowStatus.VotesTallied) {
            revert VoteIsOver("Vote is finished now. Please reset vote.");
        }
    }

    function validatePreferencesArray(uint[] calldata _orderedProposalIds) private {
        if(_orderedProposalIds.length > proposals[pv].length) {
            revert TooMuchPreferences("You can order less but no more than existing proposals.");
        }

        for(uint i = 0; i < _orderedProposalIds.length; i++) {
            if(_orderedProposalIds[i] >= proposals[pv].length) {
                revert ProposalDoesNotExit("Proposal with given id does not exist.");
            }
            if(seenValues[_orderedProposalIds[i]]) {
                revert PreferencesMustBeUnique("Ordered preferences must contain unique proposal ids.");
            } else {
                seenValues[_orderedProposalIds[i]] = true;
            }
        }

        for (uint i = 0; i < _orderedProposalIds.length; i++) {
            seenValues[_orderedProposalIds[i]] = false;
        }
    }

    //################################ UTILS

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}