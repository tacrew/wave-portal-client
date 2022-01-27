import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import "./App.css";
import ABI_JSON from "./utils/WavePortal.json";

const contractAddress = "0x05515108a7929DE53dDcECd71E54E00Ec5B6789F";
const contractABI = ABI_JSON.abi;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [waveCount, setWaveCount] = useState(undefined);
  const [message, setMessage] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (!accounts.length) {
        console.log("No authorized account found");
        return;
      }

      const account = accounts[0];
      console.log(`Found an authorized account: ${account}`);
      setCurrentAccount(account);
      await getAllWaves();
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(`Connected ${accounts[0]}`);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Ethereum object doesn't exist!");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map((wave) => ({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      }));

      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Ethereum object doesn't exist!");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      let count = await wavePortalContract.getTotalWaves();
      console.log(`Retrieved total wave count...${count.toNumber()}`);

      const waveTxn = await wavePortalContract.wave("this is a message");
      console.log(`Mining... ${waveTxn.hash}`);

      await waveTxn.wait();
      console.log(`Mined -- ${waveTxn.hash}`);

      count = await wavePortalContract.getTotalWaves();
      console.log(`Retrieved total wave count...${count.toNumber()}`);
      setWaveCount(count.toNumber());
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="hi">
            👋
          </span>{" "}
          Hey there!
        </div>
        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <div>type your message and click below button </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {isLoading ? (
          <div class="loading-wrapper">
            <div class="dot-pulse"></div>
          </div>
        ) : (
          <button className="waveButton" onClick={wave} disabled={!message}>
            Wave at Me
          </button>
        )}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {waveCount !== undefined && <div>your wave counts are {waveCount}</div>}
        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
