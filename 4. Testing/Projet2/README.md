Current Readme describes `test/unit/Voting.test.js` and thoughts.

To run tests for Voting.sol : 

`yarn hardhat clean`

`yarn hardhat test test/unit/Voting.test.js`

# Code coverage

<img width="536" alt="Screenshot 2024-02-25 at 15 03 15" src="https://github.com/beubeubeubeu/CoursAlyra/assets/4832337/d4edf73d-d118-4d20-a06f-8289a3d468d1">

I tried to have 100% on %branch coverage but never managed to get [solidity-coverage](https://github.com/sc-forks/solidity-coverage/blob/master/docs/advanced.md) to look through it. Althgough I am pretty sure the test is worth it because I can make it fail. When I delete this test I get the same coverage. Others Lovelacers had the same issue (cf. [the Discord](https://discord.com/channels/861560988683862026/1197537530866843648/1210572035659661392), I also had the same issue for other functions and "just" reordering tests augmented code coverage for %branch 🧙‍♀️. 

**Capture from `./coverage/contracts/Voting.sol.html`**:

<img width="765" alt="Screenshot 2024-02-25 at 15 03 36" src="https://github.com/beubeubeubeu/CoursAlyra/assets/4832337/ff4160ec-41da-45d6-b7c3-845d84909b3b">

I tried many things:

- add expect for success call to Ownable `.owner()` (already in Deployment part though)
- reordering tests 🧙‍♀️
- adding a `.solcover.js` file and whitelist onlyOwner (which in fact is not a good idea)
- re-read `Ownable` check owner `customError` for onlyOwner

If you have an opinion about this problem I take it !


# Notes

Globally I followed and tested from top to bottom smart contract's functions definitions.

For each function I decided to follow smart contract's implemented code pattern, check, effect, interact.

I went through fixture and not beforeEach to setup tests since I read fixtures are somehow cached and therefore faster.

I also tried to make sort of a "fuzzing" mechanism setting min max random voters and min max proposals to generate inside fixtures. I quickly googled hardhat fuzzing but not found anything that catched my attention so here too I would be glad to know more about it. Maybe I should have done a full part "fuzzing" and not always generate n voters and n proposals ?

I also mocked two `tallyVotes` situations, one with a clear winner and the other with a tied situation (I voluntarily left some `console.log` for you to easily see what is happening).

I did not covered all edge cases (I only implmemented one test with panic code for instance) and did not tried to do so that could be an improvement.

I also thought of a refacto with a loop to test cases when workflow statuses are not right but it seemed really complicated. 

Looking forward to see the correction. 😊


# Fixtures

Fixtures I defined are like russian dolls I hope it is not breaking a best practice. 🪆

- `deployedContractFixture` to deploy contract
- `registeredVotersFixture` to register some voters
- `addedProposalsFixture` to add proposals and switch status to `ProposalsRegistrationStarted`
- `submittedVotesClearWinnerFixture` to set clear winner before tallying votes
- `submittedVotesTiedWinnersFixture` to set a tie situation before tallying votes



