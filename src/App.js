import { ethers } from "ethers";
import React, {useState, useEffect} from "react";
import './App.css';
import ABI_JSON from "./utils/WavePortal.json";

const contractAddress = '0x1BEb1ceB112C36DC72b76cd8dBF4722dAeD9F87D'
const contractABI = ABI_JSON.abi

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [waveCount, setWaveCount] = useState(undefined)

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({method: 'eth_accounts'})

      if (!accounts.length) {
        console.log('No authorized account found')
        return
      }

      const account = accounts[0]
      console.log(`Found an authorized account: ${account}`)
      setCurrentAccount(account)

    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window

      if(!ethereum) {
        alert('Get Metamask!')
        return
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'})

      console.log(`Connected ${accounts[0]}`)
      setCurrentAccount(accounts[0])
    } catch(error) {
      console.log(error)
    }
  }

  const wave = async () => {
    setIsLoading(true)
    try {
      const {ethereum} = window

      if (!ethereum) {
        console.log("Ethereum object doesn't exist!")
      }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

      let count = await wavePortalContract.getTotalWaves()
      console.log(`Retrieved total wave count...${count.toNumber()}`)

      const waveTxn = await wavePortalContract.wave()
      console.log(`Mining... ${waveTxn.hash}`)

      await waveTxn.wait()
      console.log(`Mined -- ${waveTxn.hash}`)

      count = await wavePortalContract.getTotalWaves()
      console.log(`Retrieved total wave count...${count.toNumber()}`)
      setWaveCount(count.toNumber())
    } catch(error) {
      console.log(error)
    }
    setIsLoading(false)

  }



  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role='img' aria-label="hi">👋</span> Hey there!
        </div>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        {isLoading 
          ? <div class='loading-wrapper'><div class="dot-pulse"></div></div>
          : <button className="waveButton" onClick={wave}>Wave at Me </button>
        }

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>Connect Wallet</button>
        )}

        {waveCount !== undefined && <div>your wave counts are {waveCount}</div>}
      </div>
    </div>
  );
}

export default App