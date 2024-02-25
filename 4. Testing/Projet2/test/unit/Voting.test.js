const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { PANIC_CODES } = require("@nomicfoundation/hardhat-chai-matchers/panic");
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Voting smart contract's tests", function () {

  	// :::::::::::::::::::: VARS & UTILS :::::::::::::::::::::::::: //

	// Vars for pseudo fuzzing
	const MIN_RANDOM_VOTERS = 5;
	const MAX_RANDOM_VOTERS = 10;
	const MIN_RANDOM_PROPOSALS = 5;
	const MAX_RANDOM_PROPOSALS = 10;

	function randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	};

	function randomFrom0ToMax(max) {
		return Math.floor(Math.random() * max);
	}

	/**
	 *
	 * Credit: Chat GPT - let's be honest
	 *
	 * Sets last proposal as clear winner (half+1 voters)
	 *
	**/
	function votesDistributionWithClearWinner(votersCount, proposalsCount) {
		const distribution = [];

		// Assign the last proposal ID to the first half + 1 voters
		const halfVoters = Math.ceil(votersCount / 2);
		for (let i = 0; i < halfVoters; i++) {
			distribution.push(proposalsCount - 1); // Last proposal ID
		}

		// Assign the remaining voters randomly to other proposals
		for (let i = halfVoters; i < votersCount; i++) {
			const randomProposal = randomFrom0ToMax(proposalsCount - 2); // Excluding the last proposal
			distribution.push(randomProposal);
		}

		// Determine the winning proposal ID
		const winningProposalID = proposalsCount - 1; // Last proposal ID

		return { distribution, winningProposalID };
	}

	/**
	 *
	 * Credit: Chat GPT + fixs
	 *
	 * Sets tied winners and given
	 * tallyVote implementation proposition
	 * with lower id as the winner
	 *
	**/
	function votesDistributionWithTiedWinners(votersCount, proposalsCount) {
		const distribution = [];

		// Determine the number of voters for each proposal
		const halfVoters = Math.floor(votersCount / 2);

		// Assign the last proposal ID to the first group of voters
		for (let i = 0; i < halfVoters; i++) {
		  distribution.push(proposalsCount - 1); // Last proposal ID
		}

		// Assign the second-to-last proposal ID to the remaining voters
		for (let i = halfVoters; i < halfVoters * 2; i++) {
		  distribution.push(proposalsCount - 2); // Second-to-last proposal ID
		}

		// Winning proposal ID is always proposalsCount - 2
		const winningProposalID = proposalsCount - 2;

		return { distribution, winningProposalID };
	}

  	// :::::::::::::::::::: FIXTURES :::::::::::::::::::: //
	async function deployedContractFixture() {
		const [owner, sgnr1, sgnr2, sgnr3] = await ethers.getSigners();

		const Voting = await ethers.getContractFactory('Voting');
		const voting = await Voting.deploy();

		return { voting, owner, sgnr1, sgnr2, sgnr3 };
	};

	async function registeredVotersFixture() {
		const { voting, owner } = await loadFixture(deployedContractFixture);

		const nbVoters = randomIntFromInterval(MIN_RANDOM_VOTERS, MAX_RANDOM_VOTERS);
		const randomVoterId1 = randomFrom0ToMax(nbVoters);
		const randomVoterId2 = randomFrom0ToMax(nbVoters);
		let registeredVoters = [];
		for(let i = 0; i < nbVoters; i++){
			let voterWallet = ethers.Wallet.createRandom().connect(ethers.provider);
			await owner.sendTransaction({to: voterWallet.address, value: ethers.parseEther("0.1")});
			await voting.connect(owner).addVoter(voterWallet.address);
			registeredVoters.push(voterWallet);
		}
		const randomVoterWallet1 = registeredVoters[randomVoterId1];
		const randomVoterWallet2 = registeredVoters[randomVoterId2];
		const unregisteredVoterWallet = ethers.Wallet.createRandom().connect(ethers.provider);

		return { voting, owner, randomVoterWallet1, randomVoterWallet2, unregisteredVoterWallet, registeredVoters, nbVoters };
	};

	async function addedProposalsFixture() {
		const { voting, owner, nbVoters, registeredVoters, randomVoterWallet1, unregisteredVoterWallet } = await loadFixture(registeredVotersFixture);

		await voting.connect(owner).startProposalsRegistering();

		const nbProposals = randomIntFromInterval(MIN_RANDOM_PROPOSALS, MAX_RANDOM_PROPOSALS);
		const randomProposalId1 = randomFrom0ToMax(nbProposals);
		let proposerProposal = {};
		for(let i = 0; i < nbProposals; i++){
			let proposer = registeredVoters[randomFrom0ToMax(nbVoters)];
			// +1 is because one "GENESIS"proposal was created when calling startProposalsRegistering
			let desc = `Proposal ${i + 1} : This is a proposal from ${proposer.address}.`;
			proposerProposal[i] = { proposalId: (i + 1), proposer, desc };
			await voting.connect(proposer).addProposal(desc);
		}

		const randomProposerProposal1 = proposerProposal[randomProposalId1];

		return { voting, owner, randomProposerProposal1, randomVoterWallet1, unregisteredVoterWallet, nbProposals, registeredVoters, nbVoters };
	};

	async function startedVotingSessionFixture() {
		const { voting, randomVoterWallet1, nbProposals, registeredVoters, nbVoters } = await loadFixture(addedProposalsFixture);
		await voting.endProposalsRegistering();
		await voting.startVotingSession();
		return { voting, randomVoterWallet1, nbProposals, registeredVoters, nbVoters };
	}

	async function submittedVotesClearWinnerFixture() {
		const { voting, nbProposals, registeredVoters, nbVoters } = await loadFixture(startedVotingSessionFixture);
		// +1 for the genesis proposal
		const { distribution, winningProposalID } = votesDistributionWithClearWinner(nbVoters, nbProposals + 1);
		for (let i = 0; i < nbVoters; i++) {
			console.log(`[clear winner] Voter ${i + 1} votes for Proposal ${distribution[i]}`);
			await voting.connect(registeredVoters[i]).setVote(distribution[i]);
		}
		console.log(`Winner Id shoud be ${winningProposalID}`);
		await voting.endVotingSession();
		return { voting, winningProposalID };
	}

	async function submittedVotesTiedWinnersFixture() {
		const { voting, nbProposals, registeredVoters, nbVoters } = await loadFixture(startedVotingSessionFixture);
		// +1 for the genesis proposal
		const { distribution, winningProposalID } = votesDistributionWithTiedWinners(nbVoters, nbProposals + 1);
		for (let i = 0; i < distribution.length; i++) {
			console.log(`[tied winners] Voter ${i + 1} votes for Proposal ${distribution[i]}`);
			await voting.connect(registeredVoters[i]).setVote(distribution[i]);
		}
		console.log(`Winner Id shoud be ${winningProposalID}`);
		await voting.endVotingSession();
		return { voting, winningProposalID };
	}

  	// :::::::::::::::::::: TESTS ::::::::::::::::::::::: //

 	// :::::::: Deployment

	describe('Deployment', function () {

		it('Should deploy the smart contract with deployer as owner', async function () {
			const { voting, owner } = await loadFixture(deployedContractFixture);
			expect(await voting.owner()).to.equal(owner.address);
		});

		it('Should deploy the smart contract with current workflow status as RegisteringVoters', async function () {
			const { voting } = await loadFixture(deployedContractFixture);
			expect(await voting.workflowStatus()).to.equal(0);
		});

		it('Should deploy the smart contract with winningProposalId set to 0', async function () {
			const { voting } = await loadFixture(deployedContractFixture);
			expect(await voting.winningProposalID()).to.equal(0);
		});

	});

  	// :::::::: Getters

	/**
	 * getVoter()
   	 * params: address
     * return: Voter
     *
    **/
	describe('Get voter', function () {
		describe('Validations', function () {
			it('Should not be callable by a non registered address', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.getVoter(sgnr1.address)).to.be.revertedWith("You're not a voter");
			});
		});

		describe('Getter', function () {
			it('Should return a registered voter after registering n rand[10, 20] voters and fetching one of them, being one of them', async function () {
				const { voting, randomVoterWallet1, randomVoterWallet2} = await loadFixture(registeredVotersFixture);
				const voter = await voting.connect(randomVoterWallet1).getVoter(randomVoterWallet2.address);
				expect(voter.toString()).to.equal([true, false, BigInt(0)].toString());
			});

			it('Should return a non registered voter if address is not registered', async function () {
				const { voting, randomVoterWallet1, unregisteredVoterWallet} = await loadFixture(registeredVotersFixture);
				const voter = await voting.connect(randomVoterWallet1).getVoter(unregisteredVoterWallet.address);
				expect(voter.toString()).to.equal([false, false, BigInt(0)].toString());
			});
		});
	});

	/**
	 *
     * getOneProposal()
     * params: _id (uint)
     * return: Proposal
     *
    **/
	describe('Get one proposal', function () {
		describe('Validations', function () {
			it('Should not be callable by a non registered address', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
			});

			it('Should revert with panic code if proposal does not exist at id', async function () {
				const { voting, randomProposerProposal1, nbProposals } = await loadFixture(addedProposalsFixture);
				await expect( voting.connect(randomProposerProposal1.proposer).getOneProposal(nbProposals + 1) ).to.be.revertedWithPanic(PANIC_CODES.ARRAY_ACCESS_OUT_OF_BOUNDS);
			});
		});

		describe('Getter', function () {
			it('Should return one proposal after registering 20 proposals and fetching one of them, being a registered voter', async function () {
				const { voting, randomProposerProposal1 } = await loadFixture(addedProposalsFixture);
				const proposal = await voting.connect(randomProposerProposal1.proposer).getOneProposal(randomProposerProposal1.proposalId);
				expect(proposal.description).to.equal(`Proposal ${randomProposerProposal1.proposalId} : This is a proposal from ${randomProposerProposal1.proposer.address}.`);
			});

			it('Should return genesis proposal as first proposal after setting status to ProposalsRegistrationStarted', async function () {
				const { voting, randomProposerProposal1 } = await loadFixture(addedProposalsFixture);
				const proposal = await voting.connect(randomProposerProposal1.proposer).getOneProposal(0);
				expect(proposal.description).to.equal('GENESIS');
			});
		});
	});

  	// :::::::: Registration

	/**
     *
     * addVoter()
     * params: _addr (address)
     * return: void
     *
    **/
	describe('Add one voter', function () {
		describe('Validations', function () {
			it('Should revert if not called by owner', async function () {
				const { voting, owner, sgnr1, sgnr2 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).addVoter(sgnr2.address)).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});
			it('Should revert if workflow status is not RegisteringVoters', async function () {
				const { voting, unregisteredVoterWallet } = await loadFixture(addedProposalsFixture);
				await expect(voting.addVoter(unregisteredVoterWallet.address)).to.be.revertedWith('Voters registration is not open yet');
			});

			it('Should revert if address is already registered', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await expect(voting.addVoter(randomVoterWallet1.address)).to.be.revertedWith('Already registered');
			});
		});

		describe('Voter registering', function () {
			it('Should register one voter if given new address', async function () {
				const { voting, sgnr1, sgnr2 } = await loadFixture(deployedContractFixture);
				await voting.addVoter(sgnr1.address);
				let voter = await voting.connect(sgnr1).getVoter(sgnr2.address);
				expect(voter.isRegistered).to.be.false;
				await voting.addVoter(sgnr2.address);
				voter = await voting.connect(sgnr1).getVoter(sgnr2.address);
				expect(voter.toString()).to.equal([true, false, BigInt(0)].toString());
			});

			it('Should allow registering address(0)', async function () {
				const { voting, sgnr1  } = await loadFixture(deployedContractFixture);
				const zeroAddress = "0x0000000000000000000000000000000000000000";
				await voting.addVoter(sgnr1.address);
				await voting.addVoter(zeroAddress);
				let voter = await voting.connect(sgnr1).getVoter(zeroAddress);
				expect(voter.isRegistered).to.be.true;
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting, sgnr1  } = await loadFixture(deployedContractFixture);
				await expect(voting.addVoter(sgnr1.address)).to.emit(voting, "VoterRegistered").withArgs(sgnr1.address);
			});
		});
	});

	// :::::::: Proposal

	/**
     *
     * addProposal()
     * params: _desc (string)
     * return: void
     *
    **/
	describe('Add one proposal', function () {
		describe('Validations', function () {
			it('Should revert if not called by a registered voter', async function () {
				const { voting, unregisteredVoterWallet } = await loadFixture(registeredVotersFixture);
				await expect(voting.connect(unregisteredVoterWallet).addProposal('Here is a proposal.')).to.be.revertedWith("You're not a voter");
			});

			it('Should revert if workflow status is not ProposalsRegistrationStarted', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await expect(voting.connect(randomVoterWallet1).addProposal('Here is a proposal.')).to.be.revertedWith('Proposals are not allowed yet');
			});

			it('Should revert if given registered voter provides an empty description', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(addedProposalsFixture);
				await expect(voting.connect(randomVoterWallet1).addProposal('')).to.be.revertedWith('Vous ne pouvez pas ne rien proposer');
			});
		});

		describe('Proposal recording', function () {
			it('Should record one proposal if given non empty description from a registered voter', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await voting.startProposalsRegistering();
				await voting.connect(randomVoterWallet1).addProposal('Here is a proposal.');
				const proposal = await voting.connect(randomVoterWallet1).getOneProposal(1);
				expect(proposal.description).to.be.equal('Here is a proposal.');
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting, owner, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await voting.connect(owner).startProposalsRegistering();
				await expect(voting.connect(randomVoterWallet1).addProposal('Here is a proposal.')).to.emit(voting, "ProposalRegistered").withArgs(1);
			});
		});
	});

  	// :::::::: Vote

	/**
     *
     * setVote()
     * params: _id (uint)
     * return: void
     *
    **/
	describe('Set one vote', function () {
		describe('Validations', function () {
			it('Should revert if not called by a registered voter', async function () {
				const { voting, unregisteredVoterWallet } = await loadFixture(registeredVotersFixture);
				await expect(voting.connect(unregisteredVoterWallet).setVote(0)).to.be.revertedWith("You're not a voter");
			});

			it('Should revert if called when workflow status is not VotingSessionStarted', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await expect(voting.connect(randomVoterWallet1).setVote(0)).to.be.revertedWith('Voting session havent started yet');
			});

			it('Should revert if called by a registered voter that has already voted', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(startedVotingSessionFixture);
				await voting.connect(randomVoterWallet1).setVote(0);
				await expect(voting.connect(randomVoterWallet1).setVote(1)).to.be.revertedWith('You have already voted');
			});

			it('Should revert if submitted proposal does not exist', async function () {
				const { voting, randomVoterWallet1, nbProposals } = await loadFixture(startedVotingSessionFixture);
				await expect(voting.connect(randomVoterWallet1).setVote(nbProposals + 1)).to.be.revertedWith('Proposal not found');
			});
		});

		describe('Vote recording', function () {
			it('Should store proposal id in voter if given valid vote', async function () {
				const { voting, randomVoterWallet1, nbProposals } = await loadFixture(startedVotingSessionFixture);
				const proposalId = randomFrom0ToMax(nbProposals);
				await voting.connect(randomVoterWallet1).setVote(proposalId);
				const voter = await voting.connect(randomVoterWallet1).getVoter(randomVoterWallet1.address);
				expect(voter.votedProposalId).to.be.equal(proposalId);
			});

			it('Should set voter to has voted if given valid vote', async function () {
				const { voting, randomVoterWallet1, nbProposals } = await loadFixture(startedVotingSessionFixture);
				const proposalId = randomFrom0ToMax(nbProposals);
				await voting.connect(randomVoterWallet1).setVote(proposalId);
				const voter = await voting.connect(randomVoterWallet1).getVoter(randomVoterWallet1.address);
				expect(voter.hasVoted).to.be.true;
			});

			it('Should increase proposal vote count by one if given valid vote', async function () {
				const { voting, randomVoterWallet1, nbProposals } = await loadFixture(startedVotingSessionFixture);
				const proposalId = randomFrom0ToMax(nbProposals);
				let proposal = await voting.connect(randomVoterWallet1).getOneProposal(proposalId);
				const incrementedVoteCount = proposal.voteCount + BigInt(1);
				await voting.connect(randomVoterWallet1).setVote(proposalId);
				proposal = await voting.connect(randomVoterWallet1).getOneProposal(proposalId);
				expect(proposal.voteCount).to.be.equal(incrementedVoteCount);
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting, randomVoterWallet1, nbProposals } = await loadFixture(startedVotingSessionFixture);
				const proposalId = randomFrom0ToMax(nbProposals);
				await expect(voting.connect(randomVoterWallet1).setVote(proposalId)).to.emit(voting, "Voted").withArgs(randomVoterWallet1.address, proposalId);
			});
		});
	});

  	// :::::::: States

	/**
     *
     * startProposalsRegistering()
     * params: void
     * return: void
     *
    **/
	describe('Start proposals registering', function () {
		describe('Validations', function () {
			it('Should revert if not called by owner', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).startProposalsRegistering()).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});

			it('Should revert if called when workflow status is not RegisteringVoters', async function () {
				const { voting } = await loadFixture(addedProposalsFixture);
				await expect(voting.startProposalsRegistering()).to.be.revertedWith('Registering proposals cant be started now');
			});
		});

		describe('Change state', function () {
			it('Should set workflow status to ProposalsRegistrationStarted', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await voting.startProposalsRegistering();
				expect(await voting.workflowStatus()).to.equal(1);
			});

			it('Should generate genesis proposal as first proposal', async function () {
				const { voting, randomVoterWallet1 } = await loadFixture(registeredVotersFixture);
				await voting.startProposalsRegistering();
				const proposal = await voting.connect(randomVoterWallet1).getOneProposal(0);
				expect(proposal.description).to.equal('GENESIS');
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.startProposalsRegistering()).to.emit(voting, "WorkflowStatusChange").withArgs(0, 1);
			});
		});
	});

	/**
     *
     * endProposalsRegistering()
     * params: void
     * return: void
     *
    **/
	describe('End proposals registering', function () {
		describe('Validations', function () {
			it('Should revert if called when workflow status is not ProposalsRegistrationStarted', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.endProposalsRegistering()).to.be.revertedWith('Registering proposals havent started yet');
			});

			it('Should revert if not called by owner', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).endProposalsRegistering()).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});
		});

		describe('Change state', function () {
			it('Should set workflow status to ProposalsRegistrationEnded', async function () {
				const { voting } = await loadFixture(addedProposalsFixture);
				await voting.endProposalsRegistering();
				expect(await voting.workflowStatus()).to.equal(2);
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting } = await loadFixture(addedProposalsFixture);
				await expect(voting.endProposalsRegistering()).to.emit(voting, "WorkflowStatusChange").withArgs(1, 2);
			});
		});
	});

	/**
     *
     * startVotingSession()
     * params: void
     * return: void
     *
    **/
	describe('Start voting session', function () {
		describe('Validations', function () {
			it('Should revert if called when workflow status is not ProposalsRegistrationEnded', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.startVotingSession()).to.be.revertedWith('Registering proposals phase is not finished');
			});

			it('Should revert if not called by owner', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).startVotingSession()).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});
		});

		describe('Change state', function () {
			it('Should set workflow status to ProposalsRegistrationEnded', async function () {
				const { voting } = await loadFixture(addedProposalsFixture);
				await voting.endProposalsRegistering();
				await voting.startVotingSession();
				expect(await voting.workflowStatus()).to.equal(3);
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting } = await loadFixture(addedProposalsFixture);
				await voting.endProposalsRegistering();
				await expect(voting.startVotingSession()).to.emit(voting, "WorkflowStatusChange").withArgs(2, 3);
			});
		});
	});

	/**
     *
     * endVotingSession()
     * params: void
     * return: void
     *
    **/
	describe('End voting session', function () {
		describe('Validations', function () {
			it('Should revert if called when workflow status is not VotingSessionStarted', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.endVotingSession()).to.be.revertedWith('Voting session havent started yet');
			});

			it('Should revert if not called by owner', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).endVotingSession()).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});
		});

		describe('Change state', function () {
			it('Should set workflow status to VotingSessionEnded', async function () {
				const { voting } = await loadFixture(startedVotingSessionFixture);
				await voting.endVotingSession();
				expect(await voting.workflowStatus()).to.equal(4);
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting } = await loadFixture(startedVotingSessionFixture);
				await expect(voting.endVotingSession()).to.emit(voting, "WorkflowStatusChange").withArgs(3, 4);
			});
		});
	});

	/**
     *
     * tallyVotes()
     * params: void
     * return: void
     *
    **/
	describe('Tally votes', function () {
		describe('Validations', function () {
			it('Should revert if called when workflow status is not VotingSessionEnded', async function () {
				const { voting } = await loadFixture(deployedContractFixture);
				await expect(voting.tallyVotes()).to.be.revertedWith('Current status is not voting session ended');
			});

			it('Should revert if not called by owner', async function () {
				const { voting, sgnr1 } = await loadFixture(deployedContractFixture);
				await expect(voting.connect(sgnr1).tallyVotes()).to.be.revertedWithCustomError(voting, 'OwnableUnauthorizedAccount').withArgs(sgnr1.address);
			});
		});

		describe('Change state', function () {
			it('Should set workflow status to VotesTallied', async function () {
				const { voting } = await loadFixture(startedVotingSessionFixture);
				await voting.endVotingSession();
				await voting.tallyVotes();
				expect(await voting.workflowStatus()).to.equal(5);
			});

			it('Should set winner if there is a clear winning proposal', async function () {
				const { voting, winningProposalID } = await loadFixture(submittedVotesClearWinnerFixture);
				await voting.tallyVotes();
				expect(await voting.winningProposalID()).to.equal(winningProposalID);
			});

			it('Should set first winner in proposals array if there is a tied winning situation', async function () {
				const { voting, winningProposalID } = await loadFixture(submittedVotesTiedWinnersFixture);
				await voting.tallyVotes();
				expect(await voting.winningProposalID()).to.equal(winningProposalID);
			});
		});

		describe('Event emitting', function () {
			it('Should emit an event upon success', async function () {
				const { voting } = await loadFixture(startedVotingSessionFixture);
				await voting.endVotingSession();
				await expect(voting.tallyVotes()).to.emit(voting, "WorkflowStatusChange").withArgs(4, 5);
			});
		});
	});
});
