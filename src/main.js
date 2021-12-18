import * as Web3 from '@solana/web3.js';
// import Wallet from '@project-serum/sol-wallet-adapter';
import {CFG} from './config.js';
import * as anchor from '@project-serum/anchor';

const LPS = 1000000000;
const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
    "cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ"
);

async function main(){
  window.sol = {};
  connectRpc();

  clicksen('connect-btn',onClickConnect);

  async function getUserBalance() {
    return await sol.connection.getBalance(window.sol.provider.publicKey);
  }
  function connectRpc() {
    const connection = new Web3.Connection(CFG.rpcUrl);
    window.sol.connection = connection;
  }
  async function onClickConnect(){
    //await wallet.connect();
    const hasPhantom = window.solana && window.solana.isPhantom;
    const hasSolflare = window.solflare && window.solflare.isSolflare;

    if (hasPhantom && hasSolflare ) {
      // make user choose their wallet
      return showBothBtns();
    } if ( hasPhantom ) {
      attemptPhantom();
    } else if ( hasSolflare ) {
      attemptSolflare();
    } else {
      showBothBtns();
      displayErr("No wallet extension found for either Phantom or Solflare.<br> Please install one of them and refresh this website.<br> Clicking on the above buttons will take you to corresponding webpages.");
    }
  }
  async function showBothBtns() {
    hide('connect-btn');
    setPTitle("Select your wallet provider!");

    const phantomBtn = creatE('a');
    phantomBtn.style['border-radius']='0px';
    phantomBtn.style['border']='2px solid black';
    phantomBtn.classList="btn red-btn";
    phantomBtn.style['background-color']='purple';
    phantomBtn.style.color="white";
    phantomBtn.textContent="Phantom";
    phantomBtn.id="phantom-btn";

    const solflareBtn = creatE('a');
    solflareBtn.style['border-radius']='0px';
    solflareBtn.style['border']='2px solid black';
    solflareBtn.classList="btn red-btn";
    solflareBtn.style['background-color']='orange';
    solflareBtn.style.color="black";
    solflareBtn.textContent="Solflare";
    solflareBtn.id="solflare-btn";

    insertAfter(gid('connect-btn'),phantomBtn);

    insertAfter(phantomBtn,solflareBtn);

    clicksen('phantom-btn',attemptPhantom);
    clicksen('solflare-btn',attemptSolflare);
  }
  async function attemptPhantom() {
    if ( !window.solana || !window.solana.isPhantom  ) {
      window.open("https://phantom.app","_blank");
      return;
    }
    window.solana.connect()
      .then((res)=>{
        hideErr();
        window.sol.provider=window.solana;
        onWalletConnected();
    }).catch((err)=>{
        if (err.code&&err.code==4001){
          console.error(err);
          displayErr('You have cancelled the wallet connection');
        } else if (err.message) {
          displayErr(err.message);
        } else {
          displayErr('Something went wrong!');
          console.error(err);
        }
      })
  }
  async function attemptSolflare() {
    if ( !window.solflare || !window.solflare.isSolflare ) {
      window.open("https://solflare.com","_blank");
      return;
    }
    const success = await window.solflare.connect();
    if (success) {
      hideErr();
      window.sol.provider=window.solflare;
      onWalletConnected();
    } else {
      displayErr('You have cancelled the wallet connection');
    }
  }
  function displayErr(msg) {
    gid('err-msg').innerHTML=msg;
    unhide('err-wrap');
  }
  function hideErr(){
    hide('err-wrap');
  }
  async function onWalletConnected(){
    setPTitle("Choose the amount and press mint!");
    unhide('mint-controls-form');
    hide('connect-btn');
    try {
      hide('solflare-btn');
      hide('phantom-btn');
    } catch {}

    testsAfterConnection();
  }
  async function testsAfterConnection() {
    getUserBalance();
    getCMState();
  }
  async function getCMState() {
    //window.sol.provider.connection=window.sol.connection;
    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, window.sol.connection);
    clog(idl)
    if (idl) {
      const program = new anchor.Program(
          idl,
          CANDY_MACHINE_PROGRAM,
          window.sol.provider
      );

      const state = await program.account.candyMachine.fetch(
          CFG.CMID
      );
      const itemsAvailable = state.data.itemsAvailable.toNumber();
      const itemsRedeemed = state.itemsRedeemed.toNumber();
      const itemsRemaining = itemsAvailable - itemsRedeemed;

      let goLiveDate = state.data.goLiveDate.toNumber();
      goLiveDate = new Date(goLiveDate * 1000);

      clog(itemsRedeemed);
      clog(itemsAvailable);
      clog(itemsRemaining);
      clog(goLiveDate);
    }
  }

  function setPTitle(title) {
    editext('main-h',title);
  }

  // let transaction = new Transaction().add(
  //   SystemProgram.transfer({
  //     fromPubkey: wallet.publicKey,
  //     toPubkey: wallet.publicKey,
  //     lamports: 100,
  //   })
  // );
  // let { blockhash } = await connection.getRecentBlockhash();
  // transaction.recentBlockhash = blockhash;
  // transaction.feePayer = wallet.publicKey;
  // let signed = await wallet.signTransaction(transaction);
  // let txid = await connection.sendRawTransaction(signed.serialize());
  // await connection.confirmTransaction(txid);
};main()
function editext(id,text) {
  gid(id).textContent=text;
}
function clog(a) {
  console.log(a);
}
function creatE(a){
  return document.createElement(a);
}
function hide(a){
  gid(a).style.display="none";
}
function unhide(a){
  gid(a).style.display="";
}
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function gid(a){
  return document.getElementById(a);
}
function clicksen(a,fn){
  gid(a).addEventListener("click",fn);
}
