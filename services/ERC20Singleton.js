import Web3 from 'web3'

import erc20 from '../contracts/deployments/xrpl/xDAO.json';
import HDWalletProvider from "@truffle/hdwallet-provider";


const sleep = milliseconds => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}
export default async function ERC20Singleton() {

	let rpc = "https://rpc-evm-sidechain.xrpl.org";
	let devPrivateKeyHex = 'e47eb7ab976d439097f5e8fc052e485d0a460721f78f071c40412b1e74a84d7a'
	let web3;
	Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

	await sleep(500)
	if (window.localStorage.getItem("login-type") === "metamask") {
		
		web3 = new Web3(window.ethereum);
	} else {
		const provider = new Web3.providers.HttpProvider(rpc);

		const localKeyProvider = new HDWalletProvider({
			privateKeys: [devPrivateKeyHex],
			providerOrUrl: provider,
		});
		web3 = new Web3(localKeyProvider);
	}



	// create an instance of the KeyManager
	const myKM = new web3.eth.Contract(erc20.abi, erc20.address).methods

	return myKM
}
