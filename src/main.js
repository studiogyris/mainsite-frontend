import * as Web3 from '@solana/web3.js';
// import Wallet from '@project-serum/sol-wallet-adapter';
import {CFG} from './config.js';
import * as anchor from '@project-serum/anchor';

const LPS = 1000000000;
const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
    "cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ"
);
const TOTAL_ITEMS = 6;

async function main(){
  var bag = {};
  window.sol = {};
  populateDom();
  if (!connectRpc()) {
    alert("RPC connection error");
    return;
  }
  onRPCConnected();

  clicksen('connect-btn',onClickConnect);

  async function getUserBalance() {
    return await sol.provider.connection.getBalance(window.sol.walletProvider.publicKey);
  }
  function connectRpc() {
    var success = true;
    try {
      const connection = new Web3.Connection(CFG.rpcUrl);
      window.sol.provider = new anchor.Provider(connection,{}, {
          preflightCommitment: "recent", // might need a change
      });
    } catch (err) {
      console.error(err);
      success = false;
    }
    return success;
  }
  async function onRPCConnected() {

    bag.stateUpdateInterval = setInterval(updateState,6000);
    updateState();
  }

  async function updateState() {
    const state = await getCMState();
    if (state.itemsRedeemed>=TOTAL_ITEMS) {
      clearInterval(bag.stateUpdateInterval);
      setPTitle(`Collection is sold out! :(<br> you can get one from <a href="${CFG.marketplaceCollection}" target="_blank">${CFG.marketplaceName}</a>`);
    }
    editext('minted-amount',state.itemsRedeemed)

  }
  function populateDom() {
    editext('price',CFG.price);
    editext('max-per-tx',CFG.maxPerTx)
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
        window.sol.walletProvider=window.solana;
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
      window.sol.walletProvider=window.solflare;
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
    if (!window.sol.provider) {
      alert("No provider found, something wrong");
      return;
    }
    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, window.sol.provider);

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

      return {
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        goLiveDate
      }
    }
  }
  function setPTitle(title) {
    gid('main-h').innerHTML=title;

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
////////////////////////////////////////////////////
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
