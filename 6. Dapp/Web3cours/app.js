const { Web3 } = require('web3');

const rpcURL = 'https://goerli.infura.io/v3/2e10fa183f2141f4b5dc9ee59accbe42';

var web3 = new Web3(rpcURL);

const walletAddr = '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c';

web3.eth.getBalance(walletAddr).then(balance => console.log(web3.utils.fromWei(balance, 'ether')));

const abi = [
	{
		"inputs": [],
		"name": "get",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const addr = '0xfA95935932ECcd000765C772CF8A731B1E215d06';

let contract = new web3.eth.Contract(abi, addr);

contract.methods.get().call().then(result => console.log(result.toString()));