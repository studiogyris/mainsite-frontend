import { Connection, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';
import Wallet from '@project-serum/sol-wallet-adapter';

async function main(){
  let connection = new Connection(clusterApiUrl('devnet'));
  let providerUrl = 'https://solflare.com/provider';
  let wallet = new Wallet(providerUrl);
  wallet.on('connect', publicKey => console.log('Connected to ' + publicKey.toBase58()));
  wallet.on('disconnect', () => console.log('Disconnected'));

  clicksen('connect-btn',onClickConnect);


  async function onClickConnect(){
    //await wallet.connect();
    const hasPhantom = window.solana;
    const hasSolflare = window.solflare && window.solflare.isSolflare;

    if (hasPhantom && hasSolflare) {
      // make user choose their wallet
      return onBothWalletsInstalled();
    }
  }

  async function onBothWalletsInstalled() {
    hide('connect-btn');
    gid('main-h').textContent="Select your wallet provider!";

    const phantomBtn = creatE('a');
    phantomBtn.classList="btn red-btn";
    phantomBtn.style['background-color']='purple';
    phantomBtn.style.color="white";
    phantomBtn.textContent="Phantom";
    phantomBtn.id="phantom-btn";


    const solflareBtn = creatE('a');
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
    const success = await window.solana.connect();
    clog(success);
  }
  async function attemptSolflare() {
    const success = await window.solflare.connect();
    clog(success);
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
