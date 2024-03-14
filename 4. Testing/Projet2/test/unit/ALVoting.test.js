const { expect } = require("chai");
const { ethers } = require('hardhat');

require("@nomicfoundation/hardhat-toolbox/network-helpers");

//addr0, addr1, addr2 will be voters, addr3 won't
let addr0, addr1, addr2, addr3; 
let voting;

/* ************************************************************************ Fixture ************************************************************************ */

async function LoadFixtureForPhase0() {
    [addr0, addr1, addr2, addr3] = await ethers.getSigners()
    voting = await ethers.getContractFactory("Voting");
    voting = await voting.deploy();
}

async function LoadFixtureForPhase1() {
    await voting.addVoter(addr0);
    await voting.addVoter(addr1);
    await voting.addVoter(addr2);
    await voting.startProposalsRegistering();
}

async function LoadFixtureForPhase2() {
    await LoadFixtureForPhase1();
    await voting.addProposal("Bonjour");
    await voting.addProposal("Salut");
    await voting.addProposal("Au revoir");
    await voting.endProposalsRegistering();
}

async function LoadFixtureForPhase3() {
    await LoadFixtureForPhase2();
    await voting.startVotingSession();
}

async function LoadFixtureForPhase4() {
    await LoadFixtureForPhase3();
    await voting.setVote(1);
    await voting.connect(addr1).setVote(2);
    await voting.connect(addr2).setVote(2);
    await voting.endVotingSession();
}

/* ****************************************************************** TESTING ****************************************************************** */

describe("Voting Test 2", function () {
   
   beforeEach(async function() {
     await LoadFixtureForPhase0();
   });


    /* ******************************************************* Deploiement  ******************************************************************** */

    describe("Deploiement", function() {
        it('should be addr0 as the owner of the contract', async function() {
          expect(await voting.owner()).to.be.equal(addr0);
        });

        it('WinningProposalID should be equal to 0 if the smart contract has been deployed', async function() {
            expect(await voting.winningProposalID()).to.be.equal(0);
        });
    });

    
    /* ******************************************************* RegisteringVoters -  Phase 0 ******************************************************************** */


    describe("RegisteringVoters Phase", function () {
    
        describe("Function addVoter", function () {

            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).addVoter(addr1)).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.startProposalsRegistering(); 
                await expect(voting.addVoter(addr1)).to.be.revertedWith('Voters registration is not open yet');
            });

            it('should revert because the voter is alreday registered - 2nd require', async function() {
                await voting.addVoter(addr1);
                await expect(voting.addVoter(addr1)).to.be.revertedWith('Already registered');
            });

            it('should set isRegistered to true in Voter[addr0]', async function() {
                await voting.addVoter(addr1);
                expect((await voting.connect(addr1).getVoter(addr1)).isRegistered).to.be.equal(true);
            });

            it('should emit VoterRegistered event', async function() {
                await expect(voting.addVoter(addr0))
                .to.emit(voting, 'VoterRegistered')
                .withArgs(addr0);
            });

        });  


        describe("Function startProposalsRegistering", function () {

            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
              await voting.startProposalsRegistering(); 
              await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
            });

            it('should set the status to 1', async function() {
              await voting.startProposalsRegistering();
              expect(await voting.workflowStatus()).to.be.equal(1);
            });

            it('should emit WorkflowStatusChange event', async function() {
                await expect(voting.startProposalsRegistering())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(0, 1);
            });
        });

        describe("Prohibited action in the current WorkflowStatus", function() {
            
            it('addProposal should revert', async function() {
               await voting.addVoter(addr0);
               await expect(voting.addProposal("Bonjour")).to.be.revertedWith("Proposals are not allowed yet");
            });

            it('setVote should revert', async function() {
                await voting.addVoter(addr0);
                await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet");
            });

            it('tallyVotes should revert', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            });

            it('endProposalsRegistering should revert', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            });

            it('startVotingSession should revert', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            });

            it('endVotingSession should revert', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            });
          
        });

    });

    /* ******************************************************* ProposalsRegistrationStarted - Phase 1 ******************************************************************** */


    describe("ProposalsRegistrationStarted Phase", function () {
       
        beforeEach(async function() {
            await LoadFixtureForPhase1();  
        });
        
        
        describe("Function getVoter", function() {
     
            it('should revert onlyVoter - 1st Modifier', async function() {
                await expect((voting.connect(addr3).getVoter(addr1))).to.be.revertedWith("You're not a voter");
            });
        
            it('should get the voter addr0', async function() {
                let [isRegistered, hasVoted, votedProposalId] = await voting.connect(addr1).getVoter(addr0);
                expect(isRegistered).to.be.equal(true);
                expect(hasVoted).to.be.equal(false);
                expect(votedProposalId).to.be.equal(0);
            })
        });


        describe("Function addProposal", function () {
            
            it('should revert onlyVoters - 1st Modifier', async function() {
                await expect(voting.connect(addr3).addProposal("Bonjour")).to.be.revertedWith("You're not a voter");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.endProposalsRegistering();
                await expect(voting.connect(addr1).addProposal("Bonjour")).to.be.revertedWith('Proposals are not allowed yet');
            });

            it('should revert cause of the empty description - 2nd require', async function() {
                await expect(voting.connect(addr1).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
            });

            it('should set the proposal 1', async function() {
                await voting.connect(addr1).addProposal("Bonjour");
                let [description, voteCount] = await voting.getOneProposal(1);
                expect(description).to.be.equal("Bonjour");
                expect(voteCount).to.be.equal(0);
            });

            it('should emit ProposalRegistered event', async function() {
                await expect(voting.connect(addr1).addProposal("Bonjour"))
                .to.emit(voting, 'ProposalRegistered')
                .withArgs(1);
            });
        });  
        
       
        
        describe("Function endProposalsRegistering", function () {

            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.endProposalsRegistering(); 
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            });

            it('should set the status to 2', async function() {
                await voting.endProposalsRegistering();
                expect(await voting.workflowStatus()).to.be.equal(2);
            });
          
            it('should emit WorkflowStatusChange event', async function() {
                await expect(voting.endProposalsRegistering())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(1, 2);
            });

        });

        describe("Prohibited action in the current WorkflowStatus", function() {
            
            it('addVoter should revert', async function() {
                await expect(voting.addVoter(addr3)).to.be.revertedWith("Voters registration is not open yet");
            });

            it('setVote should revert', async function() {
               await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet");
            });

            it('tallyVotes should revert', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            });

            it('startProposalsRegistering should revert', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
            });

            it('startVotingSession should revert', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            });

            it('endVotingSession should revert', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            });
          
        });
    }); 

    /* ******************************************************* ProposalsRegistrationEnded - Phase 2 ******************************************************************** */
    
    describe("ProposalsRegistrationEnded Phase", function () {
       
        beforeEach(async function() {
            await LoadFixtureForPhase2();
        });
      
      
        describe("Function getOneProposal ", function() {
   
            it('should revert onlyVoter - 1st Modifier', async function() {
                await expect((voting.connect(addr3).getOneProposal(1))).to.be.revertedWith("You're not a voter");
            });
      
            it('should get the proposal 1', async function() {
                let [description, voteCount] = await voting.connect(addr1).getOneProposal(1);
                expect(description).to.be.equal("Bonjour");
                expect(voteCount).to.be.equal(0);
            })
        });

        describe("Function startVotingSession", function () {

            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.startVotingSession(); 
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            });

            it('should set the status to 3', async function() {
                await voting.startVotingSession();
                expect(await voting.workflowStatus()).to.be.equal(3);
   
            });

            it('should emit WorkflowStatusChange event', async function() {
                await expect(voting.startVotingSession())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(2, 3);
            });
  
        });

        describe("Prohibited action in the current WorkflowStatus", function() {
            
            it('addVoter should revert', async function() {
                await expect(voting.addVoter(addr3)).to.be.revertedWith("Voters registration is not open yet");
            });
            
            it('addProposal should revert', async function() {
                await expect(voting.addProposal("Bonjour")).to.be.revertedWith("Proposals are not allowed yet");
            });
 
            it('setVote should revert', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet");
            });
 
            it('tallyVotes should revert', async function() {
                 await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            });
 
            it('startProposalsRegistering should revert', async function() {
                 await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
            }); 

            it('endProposalsRegistering should revert', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            });
 
            it('endVotingSession should revert', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            });
           
         });
    });

    /* ******************************************************* StartVotingSession - Phase 3 ******************************************************************** */

    describe("StartVotingSession Phase", function () {
       
        beforeEach(async function() {
            await LoadFixtureForPhase3();
        });
        
        
        describe("Function setVote", function () {
            
            it('should revert onlyVoters - 1st Modifier', async function() {
                await expect(voting.connect(addr3).setVote(2)).to.be.revertedWith("You're not a voter");
            });

            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.endVotingSession();
                await expect(voting.setVote(1)).to.be.revertedWith('Voting session havent started yet');
            });

            it('should revert already voted - 2nd require', async function() {
                await voting.connect(addr1).setVote(1);
                await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith('You have already voted');
            });

            it('should revert proposal unknown - 3rd require', async function() {
                await expect(voting.connect(addr1).setVote(5)).to.be.revertedWith('Proposal not found');
            });

            it('should add one vote to the proposal 1', async function() {
                let [descriptionBefore, voteCountBefore] = await voting.connect(addr1).getOneProposal(1);
                await voting.connect(addr1).setVote("1");
                let [descriptionAfter, voteCountAfter] = await voting.connect(addr1).getOneProposal(1);
                voteCountBefore++;
                expect(voteCountAfter).to.be.equal(voteCountBefore);
                expect(descriptionBefore).to.be.equal(descriptionAfter);
            });
            
            it('should emit Voted event', async function() {
                await expect(voting.setVote(1))
                .to.emit(voting, 'Voted')
                .withArgs(addr0, 1);
            });
        });  

        describe("Function endVotingSession", function () {
  
            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });
  
            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.endVotingSession(); 
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            });
  
            it('should set the status to 4', async function() {
                await voting.endVotingSession();
                expect(await voting.workflowStatus()).to.be.equal(4);
     
            });

            it('should emit WorkflowStatusChange event', async function() {
                await expect(voting.endVotingSession())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(3, 4);
            });
  
        });


        describe("Prohibited action in the current WorkflowStatus", function() {
            
            it('addVoter should revert', async function() {
                await expect(voting.addVoter(addr3)).to.be.revertedWith("Voters registration is not open yet");
            });
            
            it('addProposal should revert', async function() {
                await expect(voting.addProposal("Bonjour")).to.be.revertedWith("Proposals are not allowed yet");
            });
 
            it('tallyVotes should revert', async function() {
                 await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            });
 
            it('startProposalsRegistering should revert', async function() {
                 await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
            });

            it('endProposalsRegistering should revert', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            });
 
            it('startVotingSession should revert', async function() {
                 await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            }); 
            
         });
    });

    /* ******************************************************* EndVotingSession - Phase 4 ******************************************************************** */

    describe("EndVotingSession Phase", function () {
       
        beforeEach(async function() {
            await LoadFixtureForPhase4()
        });
        
        
        describe("Function getOneProposal ", function() {
     
            it('should revert onlyVoter - 1st Modifier', async function() {
                await expect((voting.connect(addr3).getOneProposal(1))).to.be.revertedWith("You're not a voter");
            });
        
            it('should get the proposal 1', async function() {
              let [description, voteCount] = await voting.connect(addr1).getOneProposal(2);
              expect(description).to.be.equal("Salut");
              expect(voteCount).to.be.equal(2);
            })
        });
  
        describe("Function tallyVotes", function () {
  
            it('should revert onlyOwner(Ownable) - 1st Modifier', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount");
            });
  
            it('should revert cause of the wrong workflow status - 1st require', async function() {
                await voting.tallyVotes(); 
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            });
            
            it('should set the winningPropposal to 2', async function() {
                await voting.tallyVotes();
                expect(await voting.winningProposalID()).to.be.equal(2);
     
            });

            it('should set the status to 5', async function() {
                await voting.tallyVotes();
                expect(await voting.workflowStatus()).to.be.equal(5);
     
            });

            it('should emit WorkflowStatusChange event', async function() {
                await expect(voting.tallyVotes())
                .to.emit(voting, 'WorkflowStatusChange')
                .withArgs(4, 5);
            });
  
        });


        
        describe("Prohibited action in the current WorkflowStatus", function() {
            
            it('addVoter should revert', async function() {
                await expect(voting.addVoter(addr3)).to.be.revertedWith("Voters registration is not open yet");
            });
            
            it('addProposal should revert', async function() {
                await expect(voting.addProposal("Bonjour")).to.be.revertedWith("Proposals are not allowed yet");
            });
 
            it('setVote should revert', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet");
            });
 
            it('startProposalsRegistering should revert', async function() {
                 await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now");
            });

            it('endProposalsRegistering should revert', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            });
 
            it('startVotingSession should revert', async function() {
                 await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            }); 
 
             it('endVotingSession should revert', async function() {
                 await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
             });
           
         });
    });


});
