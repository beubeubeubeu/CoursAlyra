// ######################################## TEST SCENARIO

// Voters

voters[vv][address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2)] = Voter({
  isRegistered: true,
  hasVoted: false
});

voters[vv][address(0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db)] = Voter({
  isRegistered: true,
  hasVoted: false
});

voters[vv][address(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB)] = Voter({
  isRegistered: true,
  hasVoted: false
});

votersAddress[vav].push(address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2));
votersAddress[vav].push(address(0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db));
votersAddress[vav].push(address(0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB));

// Proposals

proposals[pv].push(
  Proposal({
      description: "First proposal",
      voteCount: 0
  })
);

proposals[pv].push(
  Proposal({
      description: "Second proposal",
      voteCount: 0
  })
);

proposals[pv].push(
  Proposal({
      description: "Third proposal",
      voteCount: 0
  })
);

/*
  simpleVote
  preferentialVote
*/
voteMode = "simpleVote";

/*
  allowTieSituations
  keepAllProposals
  keepWinningProposalsOnly
*/
tieMode = "keepAllProposals";

/*
  SettingUpVote
  RegisteringVoters
  ProposalsRegistrationStarted
  ProposalsRegistrationEnded
  VotingSessionStarted
  VotingSessionEnded
  VotesTallied
*/
currentWFStatus = WorkflowStatus.VotingSessionStarted;

nbVoters = 3;
nbVotes = 0;

// ######################################## END TEST SCENARIO