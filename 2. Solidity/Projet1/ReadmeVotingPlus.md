
Here are the different "features" I implemented and a last part with 3 thoughts.

# 1. New vote mode:
I implemented two vote modes, the normal and a preferential one.

During a new phase: "SetupVoteConditions", owner can set a public string variable "voteMode" to:
- mode "simpleVote" (same as before one vote per proposal)
- mode "preferentialVote":
	- if 4 proposals, 4, 3, 2, 1 or 0 points can be given to each proposal
	- 4, 3, 2, 1 must be unique for a given proposal but multiple 0 can be given
	- Highest rated proposal wins (same as before)
	- User must submit an array of proposal id (submitPreferentialVote)

Example for preferential mode if there are 3 proposals:
- [1, 2, 0] => 3 points for proposal 1, 2 points for 2 and 1 point for 0
- [0, 2] => 3 points for proposal 0, 2 points for 2 and 0 point for 1

# 2. Handle tie situations
Handle tie situations with a tie mode defined in a public string variable "tieMode". Owner can set tie mode to tie modes that:
- dont allow tie and restart vote:
	- option "keepWinningProposalsOnly" (sets the workflow status to VoteSessionStarted and only keeps winning proposals)
	- option "keepAllProposals" (sets the workflow status to VoteSessionStarted and only keeps all proposals)

- allow multiple winners :
	- option "allowTieSituations"

# 3. Handle reset vote with options:

Through the function resetVote(resetmode), owner can:

- "keepNothing" (reset everything, WFStatus is now at SettingUpVote)
- "keepConditions" (reset voters, proposals but keep conditions => WFStatus is now at RegisteringVoters
- "keepVoters" (keep conditions, keep voters, reset proposals => WFStatus is now at ProposalsRegistrationEnded)
- "keepProposals" (keep conditions, keep voters, keep proposals but reset votes => WFStatus is now at VotingSessionStarted)
- "keepTiedProposals" (keep conditions, keep voters, keep only tied proposals but reset votes => WFStatus is now at VotingSessionStarted)
# 4. Handle blank votes

- add function "submitBlankVote" that sets the voter to hasVoted true without effect on proposals points

# Thoughts

I would be glad to know best practice on those subjects below.

- Struggling with reassigning arrays and mappings, I searched the web and found the solution of making versions of them. For instance vv (voters version) is a uint that allow me to do a mapping of vv => {voters}. I don't know if it's a good solution but it seems to work. Maybe in the end the mapping is too big.

- Its incredibly difficult to test. I made a VotingPlusTestData.js file and copy pasted it in my constructor and console.log the position of the execution of the contract since I did not find how to console.log variables inside functions (got errors when doing so). I think this is the first language I will be glad to know how to automate testing.

- I have a warning telling me my contract's byte size is too high. I should go through inheritance I guess, also Chat GPT tells me I should avoid string litterals in revert, which I will do in the future.