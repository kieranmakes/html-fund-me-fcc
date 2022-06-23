import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

let connectBtn = document.getElementById("connectButton");
let fundBtn = document.getElementById("fund");
let withdrawBtn = document.getElementById("withdraw");

connectBtn.onclick = connect;
fundBtn.onclick = fund;
withdrawBtn.onclick = withdraw;

async function connect() {
  try {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_requestAccounts" }).then(() => {
        connectBtn.innerHTML = "Connected!";
      });
    } else {
      connectBtn.innerHTML = "Please install metamask";
    }
  } catch (e) {
    console.log(e);
  }
}

async function getBalance() {
  try {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      let b = ethers.utils.formatEther(balance);
      console.log(b);
      document.getElementById("balance").innerHTML = b;
    }
  } catch (e) {
    console.log(e);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log("Mining " + transactionResponse.hash + "...");
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReciept) => {
      console.log(
        `Completed with ${transactionReciept.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function fund() {
  try {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log("funding with " + ethAmount + "...");
    if (typeof window.ethereum !== "undefined" && ethAmount) {
      // provider - connection  to blockchain
      // signer / wallet / someone with gas
      // contract - ABI & address
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // wait for tx to finish
      await listenForTransactionMine(transactionResponse, provider).then(() => {
        getBalance();
        document.getElementById("ethAmount").value = null;
        alert("Success");
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function withdraw() {
  console.log("hello");
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing....");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const balance = await provider.getBalance(contractAddress);
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      getBalance();
    } catch (e) {
      console.log(e);
    }
  }
}

getBalance();
