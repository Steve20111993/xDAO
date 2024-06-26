import React, { useState, useEffect } from "react";
import NavLink from "next/link";
import { Button } from "@heathmont/moon-core-tw";
import { SoftwareLogOut } from "@heathmont/moon-icons-tw";
import useContract from "../../../services/useContract";
import { useXRPLContext } from "../../../contexts/XRPLContext";
declare let window: any;
let running = false;
export function Nav(): JSX.Element {

  const { XrplWalletAddress,BalanceXRPL,client} = useXRPLContext();
  const {contract} = useContract();
  const [acc, setAcc] = useState('');
  const [Balance, setBalance] = useState("");
  const [count, setCount] = useState(0);

  const [isSigned, setSigned] = useState(false);
  async function fetchInfo() {
    if ( (typeof window.ethereum == "undefined")) {
      window.document.getElementById("withoutSign").style.display = "none";
      window.document.getElementById("withSign").style.display = "none";
      window.document.getElementById("installMetamask").style.display = "";
      running = false;
      return;
    } else {
      window.document.getElementById("withoutSign").style.display = "";
      window.document.getElementById("withSign").style.display = "none";
      window.document.getElementById("installMetamask").style.display = "none";
    }
    if (window.localStorage.getItem("loggedin") == "true" && window.localStorage.getItem("login-type") == "xrpl") {
      if (XrplWalletAddress != null && XrplWalletAddress != '') {
        try {

          let Balance = BalanceXRPL;
          let subbing = 10;

          if (window.innerWidth > 500) {
            subbing = 20;
          }

          setAcc(XrplWalletAddress.toString().substring(0, subbing) + "...");
          setBalance(Number(Balance) + " XRP");
          if (!isSigned)
            setSigned(true);

          window.document.getElementById("withoutSign").style.display = "none";
          window.document.getElementById("withSign").style.display = "";
          running = false;
          return;
        } catch (error) {
          console.error(error);
          running = false;
          return;
        }

      } else {
        running = false;
        return;
      }

    } else if (window.localStorage.getItem("loggedin") == "true" && window.localStorage.getItem("login-type") == "metamask") {
      if (window.ethereum.selectedAddress != null ) {
        try {
          const Web3 = require("web3")
          const web3 = new Web3(window.ethereum)
          let Balance = await web3.eth.getBalance(window.ethereum.selectedAddress);
          let subbing = 10;

          if (window.innerWidth > 500) {
            subbing = 20;
          }
   
          setAcc(window.ethereum.selectedAddress.toString().substring(0, subbing) + "...");
          setBalance(Balance / 1e18 + " XRP");
          if (!isSigned)
            setSigned(true);

          window.document.getElementById("withoutSign").style.display = "none";
          window.document.getElementById("withSign").style.display = "";
          running = false; 
           return;
        } catch (error) {
          console.error(error);
          running = false;
          return;
        }
      } else {
        running = false;
        return;
      }
    }
    else {
      setSigned(false);
      window.document.getElementById("withoutSign").style.display = "";
      window.document.getElementById("withSign").style.display = "none";
    }
  }
  useEffect(() => {
    fetchInfo();
  }, [XrplWalletAddress,contract]);




  async function onClickDisConnect() {
  
    window.localStorage.setItem("loggedin", "");
    window.localStorage.setItem("login-type", "");
    window.localStorage.setItem("UserWallet", "");
    window.location.href = "/";
  }

  return (
    <nav className="main-nav w-full flex justify-between items-center">
      <ul className="flex justify-between items-center w-full">
        {isSigned ? (<>

          <li>
            <a href="/daos" >
              <Button style={{ background: 'none', border: '0px', color: 'white' }}> DAO</Button>
            </a>
          </li>
          <li>
            <a href="/CreateDao">
              <Button style={{ background: 'none', border: '0px', color: 'white' }}>Create DAO</Button>
            </a>
          </li>
        </>) : (<></>)}

        <li className="Nav walletstatus flex flex-1 justify-end gap-2">
          <div className="py-2 px-4 flex row items-center" id="withoutSign">

            <a href="/login?[/]">
              <Button variant="tertiary">Log in</Button>
            </a>
          </div>
        
          <div
            id="installMetamask"
            style={{ display: "none" }}
            className="wallets"
          >
            <div className="wallet">
              <Button variant="tertiary" onClick={() => { window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank") }}> Metamask</Button>
            </div>
          </div>

          <div id="withSign" className="wallets" style={{ display: "none" }}>
            <div className="wallet" style={{ height: 48, display: "flex", alignItems: "center" }}>
              <div className="wallet__wrapper gap-4 flex items-center">
                <div className="wallet__info flex flex-col items-end">
                  <a className="text-primary">
                    <div className="font-light text-goten">{acc}</div>
                  </a>
                  <div className="text-goten">{Balance}</div>
                </div>
                <Button iconOnly onClick={onClickDisConnect}>
                  <SoftwareLogOut
                    className="text-moon-24"
                    transform="rotate(180)"
                  ></SoftwareLogOut>
                </Button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
}
