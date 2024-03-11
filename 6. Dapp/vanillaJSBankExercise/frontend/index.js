import { ethers } from './ethers.min.js';
import { abi, contractAddress } from './constants/index.js';

const connectButton = document.getElementById('connectButton');
const sendEthersButton = document.getElementById('sendEthersButton');
const sendEthersInput = document.getElementById('sendEthersInput');
const withdrawEthersInput = document.getElementById('withdrawEthersInput');
const withdrawEthersButton = document.getElementById('withdrawEthersButton');
const ethersBalanceOfUser = document.getElementById('ethersBalanceOfUser');
const contractBalanceOfUser = document.getElementById('contractBalanceOfUser');

let connectedAccount;

connectButton.addEventListener('click', async function() {
  if(typeof window.ethereum !== 'undefined') {
      const resultAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
      connectedAccount = ethers.getAddress(resultAccount[0]);
      connectButton.innerHTML = "Connected with " + connectedAccount.substring(0, 4) + "..." + connectedAccount.substring(connectedAccount.length - 4);
      await getContractBalanceOfUser();
      await getEthersBalanceOfUser();
  }
  else {
      connectButton.innerHTML = "Please install Metamask";
  }
})

sendEthersButton.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            let inputNumberByUser = sendEthersInput.value;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            let transaction = await contract.sendEthers({value: ethers.parseEther(inputNumberByUser)})
            await transaction.wait();
            sendEthersInput.value = '';
            await getEthersBalanceOfUser();
            await getContractBalanceOfUser();
        }
        catch(e) {
            console.log(e);
        }
    }
})

withdrawEthersButton.addEventListener('click', async function() {
    if(connectedAccount) {
        try {
            let withdrawEthersAmount = ethers.parseEther(withdrawEthersInput.value);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            let transaction = await contract.withdraw(withdrawEthersAmount)
            await transaction.wait();
            withdrawEthersInput.value = '';
            await getEthersBalanceOfUser();
            await getContractBalanceOfUser();
        }
        catch(e) {
            console.log(e);
        }
    }
})

async function getContractBalanceOfUser() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    console.log(connectedAccount);
    let balance = await contract.getBalanceOfUser(connectedAccount);
    console.log(balance);
    contractBalanceOfUser.innerHTML = ethers.formatEther(balance) + " ETH";
  } catch(e) {
    console.log(e)
  }
}

async function getEthersBalanceOfUser() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let balance = await provider.getBalance(connectedAccount);
    ethersBalanceOfUser.innerHTML = ethers.formatEther(balance) + " ETH";
  } catch(e) {
    console.log(e)
  }
}