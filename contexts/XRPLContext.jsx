"use client";
import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { Xumm } from 'xumm'
import { XrplClient } from 'xrpl-client'
import { Client } from "xrpl";
import { providers } from "ethers";
import { XrplBridgeDoor, EthersBridgeDoor } from "xchain-sdk";
import { BridgeManager } from "xchain-sdk";
import { BridgeDirection } from "xchain-sdk"
import {
    EthersXChainProvider,
    EthersXChainSigner,
    EthersXChainWallet
} from "xchain-sdk";
import { Wallet } from "ethers";

import {
    XrplXChainProvider,
    XrplXChainSigner,
    XrplXChainWallet
} from "xchain-sdk";



const AppContext = createContext({
	ConnectXummXrpl: async () => { },
	XrplWalletAddress: null,
	BalanceXRPL: 0,
	client: null,
	LogoutXummXrpl: async () => { },
	SendXRPfromLedgerToEVM: async () => { }
});

export const Testnet = {
	NodeUrl: "wss://clio.altnet.rippletest.net:51233",
	EvmNodeUrl: "https://rpc-evm-sidechain.xrpl.org",
	xumm_api: "3d1c0821-4754-4929-a062-a1a4f600e977",
	xumm_secret: "0b77ee69-607a-423e-8935-efd572214a32"

};
export function XRPLProvider({ children }) {
	const [XrplWalletAddress, setXrplWalletAddress] = useState('')
	const [Balance, setBalance] = useState(0)
	const [xumm, setXumm] = useState(null)
	const [client, setClient] = useState(null)

	async function ConnectXummXrpl() {
		await xumm.authorize()

		setXrplWalletAddress(await xumm.user.account)
	}
	async function LogoutXummXrpl() {
		await xumm.logout()

		setXrplWalletAddress(await xumm.user.account)
	}
	async function GetBalance(client, xumm) {
		const account_info = await client.send({ command: "account_info", account: await xumm.user.account });
		setBalance(Number(account_info['account_data'].Balance) / 1e6)
	}

	async function SendXRPfromLedgerToEVM(from,target) {

		const xprlTestnetProvider = new XrplXChainProvider(
			new Client(Testnet.NodeUrl)
		);
		const xrplEvmSidechainProvider = new EthersXChainProvider(
			new providers.JsonRpcProvider(Testnet.EvmNodeUrl)
		);


		const xrplTestnetBridgeDoor = new XrplBridgeDoor(
			xprlTestnetProvider,
			from,
			"XRPL Testnet"
		);
		const xrplEvmSidechainBridgeDoor = new EthersBridgeDoor(
			xrplEvmSidechainProvider,
			target,
			"XRPL EVM Sidechain"
		);


		const bridgeManager = await BridgeManager.createAsync(
			xrplTestnetBridgeDoor, xrplEvmSidechainBridgeDoor
		);

		const bridge = await bridgeManager.getBridge(
			BridgeDirection.LOCKING_TO_ISSUING, "XRP"
		);

		const xrplTestnetWallet = new XrplSeedXChainWallet(
			"sEd73o3ZsMSvVj4gKHAaCnsenYPP7Sg", xprlTestnetProvider
		);
		const xrplEvmSidechainWallet = new EthersPrivateKeyXChainWallet(
			"e47eb7ab976d439097f5e8fc052e485d0a460721f78f071c40412b1e74a84d7a", xrplEvmSidechainProvider
		);
		bridgeManager.on(
			"stage",
			(stage) => console.log(`Transfer is in the ${stage} stage`)
		);
		const result = await bridgeManager.transfer(
			bridge,
			xrplTestnetWallet,
			xrplEvmSidechainWallet,
			"10"
		);
	}

	useEffect(() => {
		setTimeout(async () => {
			const xumm_local = new Xumm(Testnet.xumm_api, Testnet.xumm_secret)
			setXumm(xumm_local)
			const client_local = new XrplClient(Testnet.NodeUrl);
			setClient(client_local)

			if (window.localStorage.getItem("loggedin") == "true" && window.localStorage.getItem("login-type") == "xrpl") {
				let local_address = await xumm_local.user.account;
				await GetBalance(client_local, xumm_local)
				window.selectedAddress = local_address;
				setXrplWalletAddress(local_address);
			}
		}, 100);
	}, [])
	return (
		<AppContext.Provider value={{ XrplWalletAddress: XrplWalletAddress, ConnectXummXrpl: ConnectXummXrpl, BalanceXRPL: Balance, client: client,SendXRPfromLedgerToEVM:SendXRPfromLedgerToEVM, LogoutXummXrpl: LogoutXummXrpl }}>
			{children}
		</AppContext.Provider>
	);
}

export const useXRPLContext = () => useContext(AppContext);


export class XrplSeedXChainWallet extends XrplXChainWallet {
    constructor(seed, provider) {
        super(new XrplXChainSigner(Wallet.fromSeed(seed), provider));
    }
}

export class EthersPrivateKeyXChainWallet extends EthersXChainWallet {
    constructor(privateKey, provider) {
        super(new EthersXChainSigner(new Wallet(privateKey, provider.ethersProvider)));
    }
}