import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import ABI_JSON from "./utils/WavePortal.json";

const contractAddress = "0x0771594d6112126e65c13F41700cdBC3C091d20b";
const contractABI = ABI_JSON.abi;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allWaves, setAllWaves] = useState([]);
  const [waveCount, setWaveCount] = useState(undefined);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

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

      const waveTxn = await wavePortalContract.wave(message, {
        gasLimit: 300000,
      });
      console.log(`Mining... ${waveTxn.hash}`);

      await waveTxn.wait();
      console.log(`Mined -- ${waveTxn.hash}`);

      count = await wavePortalContract.getTotalWaves();
      console.log(`Retrieved total wave count...${count.toNumber()}`);
      setWaveCount(count.toNumber());
      setMessage("");
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
    <div className="mx-auto pt-16 text-center">
      <h1 className="text-[40px] font-bold">
        <span role="img" aria-label="hi">
          👋
        </span>
        ようこそ!
      </h1>

      <p className="mt-4 text-lg">
        I am tacrew and I'm frontend dev at Tokyo, Japan. <br />
        Connect your Ethereum wallet and wave at me!
        <br />
        Please connect your wallet to
        <span className="font-bold text-red-500">Rinkeby test network</span>
      </p>

      <div className="mt-8 text-lg font-bold">
        type your message and click below button
      </div>

      <input
        type="text"
        value={message}
        placeholder="message"
        onChange={(e) => setMessage(e.target.value)}
        className="mt-4 py-2 px-4 w-[360px] border border-gray-400 rounded"
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <button
            onClick={wave}
            disabled={!message}
            className="block mx-auto px-6 py-2 bg-blue-600 text-white rounded hover:opacity-90 cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Wave at Me
          </button>
        )}
      </div>

      {!currentAccount && (
        <button
          onClick={connectWallet}
          className="block mt-4 mx-auto px-6 py-2 bg-amber-600 text-white rounded hover:opacity-90 cursor-pointer"
        >
          Connect Wallet
        </button>
      )}

      {waveCount !== undefined && (
        <div className="mt-6 text-lg">
          you waved{" "}
          <span className="text-xl font-bold text-red-600">{waveCount}</span>{" "}
          times!
        </div>
      )}

      <h2 className="mt-6 text-xl font-bold">Messages</h2>
      <ul className="mt-2 w-[480px] mx-auto divide-y">
        {allWaves.map((wave, index) => {
          return (
            <li key={index} className="py-2">
              <div className="text-lg font-bold text-left">{wave.message}</div>
              <div className="text-sm text-right text-gray-500">
                by {wave.address}
              </div>
              <div className="text-sm text-right text-gray-500">{`${wave.timestamp.toLocaleDateString()} ${wave.timestamp.toLocaleTimeString()}`}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default App;
