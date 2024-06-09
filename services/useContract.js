import { useState, useEffect } from "react";
import ERC20Singleton from './ERC20Singleton';

export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		contract: null,
		
		sendTransaction: sendTransaction
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (window.localStorage.getItem("loggedin") === "true") {
					const contract = { contract: null,  sendTransaction: sendTransaction };

					contract.contract = await ERC20Singleton();
					window.contract = contract.contract;

					if (window.localStorage.getItem("login-type") === "metamask") {
						window.selectedAddress = window.ethereum.selectedAddress;
						window.signerAddress = window.ethereum.selectedAddress;
					} 
					setContractInstance(contract);
				}

			} catch (error) {
				console.error(error)
			}
		}

		fetchData()
	}, [])

	async function sendTransaction(methodWithSignature) {
		let output = await methodWithSignature.send({
			from: window.signerAddress
		});
		return output;
	}


	return contractInstance
}


