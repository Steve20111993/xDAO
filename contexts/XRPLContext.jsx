"use client";
import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import sdk from '@crossmarkio/sdk';
import { XrplClient } from 'xrpl-client';


import {
	Bridge,
	BridgeManager,
	BridgeDirection,
	XrplBridgeDoor,
	XChainAddress,
	XrplXChainProvider,
	EthersTransactionParser,
	EthersXChainProvider, EthersBridgeDoor, XrplXChainWallet, EthersXChainSigner, EthersXChainWallet, XrplXChainSigner
} from "xchain-sdk";
import { Client } from "xrpl";
import { providers, Wallet as EthersWallet, ethers } from "ethers";





const AppContext = createContext({
	ConnectCrossMarkXrpl: async () => { },
	XrplWalletAddress: null,
	BalanceXRPL: 0,
	client: null,
	SendXRPfromLedgerToEVM: async (from, target, amount) => { }
});

export const Testnet = {
	NodeUrl: "wss://s.devnet.rippletest.net:51233",
	EvmNodeUrl: "https://rpc-evm-sidechain.xrpl.org",
	private_key: "e47eb7ab976d439097f5e8fc052e485d0a460721f78f071c40412b1e74a84d7a"

};
export function XRPLProvider({ children }) {
	const [XrplWalletAddress, setXrplWalletAddress] = useState('')
	const [Balance, setBalance] = useState(0)
	const [client, setClient] = useState(null)

	async function ConnectCrossMarkXrpl() {
		
		let { request, response, createdAt, resolvedAt } = await sdk.methods.signInAndWait();

		setXrplWalletAddress(response.data.address)
		window.localStorage.setItem('UserWallet', response.data.address);

	}
	async function GetBalance( wallet) {

		const balance_info = await window.client.getBalances(wallet);
		setBalance(Number(balance_info[0].value))
	}

	async function SendXRPfromLedgerToEVM(from, target, amount) {

		const MAINCHAIN_NODE_URL = Testnet.NodeUrl;
		const SIDECHAIN_NODE_URL = Testnet.EvmNodeUrl;
		const MAINCHAIN_PROVIDER = new XrplXChainProvider(new Client(MAINCHAIN_NODE_URL));
		const SIDECHAIN_PROVIDER = new EthersXChainProvider(new providers.JsonRpcProvider(SIDECHAIN_NODE_URL));
		const MAINCHAIN_DOOR = new XrplBridgeDoor(MAINCHAIN_PROVIDER, "rnJnBjnpTZPmUyZsW2QSenZhEwPzEuRSxz", "XRPL Testnet");
		const SIDECHAIN_DOOR = new EthersBridgeDoor(
			SIDECHAIN_PROVIDER,
			"0xB5f762798A53d543a014CAf8b297CFF8F2F937e8",
			"EVM Sidechain Testnet",
		);


		const bridgeManager = await BridgeManager.createAsync(MAINCHAIN_DOOR, SIDECHAIN_DOOR);

		const xChainBridges = await bridgeManager.getXChainBridges();


		const bridge = new Bridge(BridgeDirection.LOCKING_TO_ISSUING, xChainBridges[0]);
		const bridgeContract = await SIDECHAIN_PROVIDER.getBridgeContract(SIDECHAIN_DOOR.address, new EthersWallet(Testnet.private_key, new providers.JsonRpcProvider(SIDECHAIN_NODE_URL)));



		const originType = bridge.originXChainBridgeChain.type;
		const originAddress = new XChainAddress(from, originType);
		const originAddressForDestination = originAddress.for(bridge.destinationType)

		const bridgeForDestination = bridge.format === bridge.destinationType ? bridge : bridge.forDestination();
		let transactionParser = new EthersTransactionParser(new providers.JsonRpcProvider(SIDECHAIN_NODE_URL))
		// CreateClaim
		const ClaimContractTx = await bridgeContract.createClaimId(bridgeForDestination.xChainBridge, originAddressForDestination, {
			value: bridgeForDestination.destinationXChainBridgeChain.signatureReward,
		});
		const createClaimResult = await transactionParser.parseCreateClaimTransactionResponse(ClaimContractTx).wait();

		// End



		const destinationAddress = new XChainAddress(target, bridge.destinationXChainBridgeChain.type);
		const bridgeForOrigin = bridge.format === bridge.originType ? bridge : bridge.forOrigin();
		const destinationAddressForOrigin = destinationAddress.for(bridge.originType);

		const tx = {
			TransactionType: "XChainCommit",
			XChainBridge: bridgeForOrigin.xChainBridge,
			XChainClaimID: createClaimResult.claimId.hex,
			OtherChainDestination: destinationAddressForOrigin,
			Amount: (amount * 1e6).toString(),
			Account: from,
		};
		

		let filled = await client.autofill(tx);
		const ts_signed = sdk.methods.signAndSubmitAndWait(filled)
		return ts_signed;

	}

	useEffect(() => {
		setTimeout(async () => {

			if (client == null){

				let sdkclient = new  Client(Testnet.NodeUrl)
				window.client = sdkclient;
				await sdkclient.connect()
				setClient(sdkclient);
			}

			if (window.localStorage.getItem("loggedin") == "true" && window.localStorage.getItem("login-type") == "xrpl") {
				let local_address = window.localStorage.getItem('UserWallet');
				if (local_address != ""){
					await GetBalance( local_address)
					window.selectedAddress = local_address;
					setXrplWalletAddress(local_address);

				}
			}
		}, 100);
	}, [])
	return (
		<AppContext.Provider value={{ XrplWalletAddress: XrplWalletAddress, ConnectCrossMarkXrpl: ConnectCrossMarkXrpl, BalanceXRPL: Balance, client: client, SendXRPfromLedgerToEVM: SendXRPfromLedgerToEVM }}>
			{children}
		</AppContext.Provider>
	);
}

export const useXRPLContext = () => useContext(AppContext);
