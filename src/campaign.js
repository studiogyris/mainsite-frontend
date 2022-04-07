import * as Web3 from '@solana/web3.js';
import {CFG} from './config.js';
import * as anchor from '@project-serum/anchor';


const messagesToSign = {
  1: '[Gyris] I want to reroll the non-visual attributes of my Bura #',
  2: '[Gyris] I want to rename my Bura #',
  3: '[Gyris] I want to add a backstory to my Bura #',
}



// ********[ Entry function ]*******
async function main(){
  const mapping = await fetch('/campaign/mapping.json').then((res)=>{
    return res.json()})

  clicksen('connect-btn',onClickConnect);
  clicksen('back-btn',onClickBack);
  gid('input-buraid').addEventListener('input', onInputBuraID);
  // personal convenience object
  var bag = {
    sol: {},
    submittedTxsAmount : 0,
    staticInfoInitialized: false,
    cmState: {
    },
    balances: {
      sol: {},
      WLToken: undefined
    },
  };
 
  while (!connectRpc()) {
    setPTitle("Trying to establish connection to an RPC endpoint...");
    await sleep('1000');
  }
  
  onRPCConnected();
  
  function onClickBack() {
    window.location.href='..';
  }
  
  // returns true/false based on an attempt to create an RPC connection and save it in bag.sol.provider
  function connectRpc() {
    var success = true;
    try {
      const connection = new Web3.Connection(CFG.rpcUrl);
      bag.sol.provider = new anchor.Provider(connection,{}, {
          preflightCommitment: "recent",
      });
    } catch (err) {
      console.error(err);
      success = false;
    }
    return success;
  }
  // function that gets called when RPC endpoint is successfully connected
  async function onRPCConnected() {
  
  }
  

  function onInputBuraID(){
    const inputE = gid("input-buraid");
    const v = inputE.value;
    if (  v<0 || v===0 ){
      inputE.value="";
    } else if ( v>2734){
        inputE.value=2734;
    }
}
 
  // promise version of sleep
  async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
 
  // function called after clicking the connect button
  async function onClickConnect(){
    //await wallet.connect();
    const hasPhantom = window.solana && window.solana.isPhantom;
    const hasSolflare = window.solflare && window.solflare.isSolflare;

    disable('connect-btn');

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
  // hides message box
  function clearMsg(){
    hide('display-msg-wrap');
  }
  // hides error message
  function clearErr(){
    hide('err-wrap');
  }
  
  // displays both wallet providers if both extensions are found 
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
  // prompts phantom extension for wallet connection
  async function attemptPhantom() {
    if ( !window.solana || !window.solana.isPhantom  ) {
      window.open("https://phantom.app","_blank");
      return;
    }
    window.solana.connect()
      .then((res)=>{
        clearErr();
        bag.sol.walletProvider=window.solana;
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
  // prompts solflare extension for wallet connection
  async function attemptSolflare() {
    if ( !window.solflare || !window.solflare.isSolflare ) {
      window.open("https://solflare.com","_blank");
      return;
    }
    const success = await window.solflare.connect();
    if (success) {
      clearErr();
      bag.sol.walletProvider=window.solflare;
      onWalletConnected();
    } else {
      displayErr('You have cancelled the wallet connection');
    }
  }
  // displays a red error
  function displayErr(msg) {
    gid('err-msg').innerHTML=msg;
    unhide('err-wrap');
  }
  // displays a green message
  function displayMsg(msg) {
    gid('display-msg').innerHTML=msg;
    unhide('display-msg-wrap');
  }
 

  // shortens the public address
  function shortenAddress (address, chars = 4) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
  // function that gets called after wallet connection has been done for the first time
  async function onWalletConnected(){
    
    hide('connect-btn');
    try {
      hide('solflare-btn');
      hide('phantom-btn');
    } catch (er){}
    
    unhide('connected-account-wrap');
  
    editext('connected-account',shortenAddress(bag.sol.walletProvider.publicKey.toString()))
 
    bag.connectPressed = true;

    // listens for accounts changes and prompts connection if detected
    setInterval(async function() {
      if (!bag.sol.walletProvider.publicKey) {
        await bag.solana.connect();
        editext('connected-account',shortenAddress(bag.sol.walletProvider.publicKey.toString()))
      }
    }, 300);

    if (window.location.pathname=='/campaign/reroll-nonvis/') {
      clicksen('action-btn',onClickReroll);
      setPTitle(`Input the ID of the Bura you'd like to Reroll`);
    } else if (window.location.pathname=='/campaign/rename/') {
      clicksen('action-btn',onClickRename);
      setPTitle(`1) Input the ID of the Bura<br>2) Input the new name<br>3) Click rename`);
      unhide('warning-wrap');
      gid('input-name').addEventListener('input',onInputName);
      gid('input-name').addEventListener('focusout',onFocusOutName);
    } else if (window.location.pathname=='/campaign/backstory/') {
      clicksen('action-btn',onClickBackstory);
      setPTitle(`Input the ID of the Bura you'd like to Add a Backstory to`);
      unhide('warning-wrap');
      gid('text-backstory').addEventListener('input',onInputBS);
      if (window.screen.width<900) {
        
        gid('text-backstory').style.width=window.screen.width*9/10+'px';
      }
    }

      unhide('controls-form');
  }
  function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function onFocusOutName(){
    const value = gid('input-name').value.trim();
    gid('input-name').value=cap(value)
    
    const valid = /^(?<firstchar>(?=[A-Za-z]))((?<alphachars>[A-Za-z])|(?<specialchars>[A-Za-z]['-](?=[A-Za-z]))|(?<spaces> (?=[A-Za-z])))*$/.test(value)
    if (!valid) gid('input-name').value='INVALID NAME';
  }

  async function onInputName(){
    const { value } = gid('input-name');
    if (value.length>25) {
      gid('input-name').value=value.slice(0,25);
    }
    
  }

  async function onInputBS(){
    const { value } = gid('text-backstory');
    if (value.length>2000) {
      gid('text-backstory').value=value.slice(0,2000);
    }
    
  }


  async function validateSignSend(actionNum){
    var name,backstory;

    if (actionNum==2) {
      await onFocusOutName();
      name = gid('input-name').value;
      if (name=='INVALID NAME') return;
      if (name.length<3) {
        return displayErr('Name has to be atleast 3 characters long!')
      }
    } else if (actionNum==3) {
      backstory = gid('text-backstory').value;
      if (backstory.length<200) {
        return displayErr('Backstory has to be atleast 200 characters long!')
      } 
    }


    const buraID = gid('input-buraid').value;

    if (buraID == '' || isNaN(buraID) || parseInt(buraID)<0 || parseInt(buraID)>2734 ) {
      displayErr('Please input correct BuraID');
      return;
    }

    if (!mapping[buraID]) {
      displayErr("This Bura hasn't been minted yet");
      return;
    }
    clearErr();
    clearMsg();

    const message = messagesToSign[actionNum]+buraID;

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await bag.sol.walletProvider.signMessage(encodedMessage, "utf8");

    
   
    var url = CFG.backendURL +'/campaign/';


    const Data = {
      signedMessage,
      buraID
    }

    var successMsg,btntext;
    if (actionNum==1) {
      url = url + 'reroll'
      btntext = 'Reroll'
      successMsg =   `Your submission to reroll non-visual attributes of Bura #${buraID} has been recorded. Why not <u style='color:red;'>share it on twitter?</u> `;
    } else if (actionNum==2) {
      gid('twitter-btn').setAttribute('data-text',gid('twitter-btn').getAttribute('data-text').split('#')[0] + `#${buraID} to: ` + `" ${name} "` + gid('twitter-btn').getAttribute('data-text').split('#')[1]);
      url = url + 'rename'
      btntext = 'Rename'
      Data.name = name;
      successMsg = `Your submission to rename Bura #${buraID} has been recorded. Why not <u style='color:red;'>share it on twitter?</u>`;
    } else {
      gid('twitter-btn').setAttribute('data-text',gid('twitter-btn').getAttribute('data-text').split('#')[0] + `#${buraID}` + gid('twitter-btn').getAttribute('data-text').split('#')[1]);
      gid('twitter-btn').setAttribute('data-text',gid('twitter-btn').getAttribute('data-text').split('-')[0] + `https://gyris.io/campaign/submissions?buraid=${buraID}` + gid('twitter-btn').getAttribute('data-text').split('-')[1]);
      url = url + 'backstory'
      btntext = 'Submit'
      Data.backstory = backstory;
      successMsg = `Your submission to add a backstory to Bura #${buraID} has been recorded. Why not <u style='color:red;'>share it on twitter?</u>`
    }
    
    const params = {
      headers: {"content-type":"application/json; charset=UTF-8"},
      body: JSON.stringify(Data),
      method: 'POST'
    }
    gid('action-btn').value='Waiting...'
    fetch(url,params)
    .then((res)=>{
      return res.json();
    })
    .then((res)=>{
      console.log(res);
      gid('action-btn').value=btntext;
      if (res.code<0){
        displayErr(res.message)
      } else {
        displayMsg(`<strong>Success!</strong>  `+successMsg);
        unhide('twitter-btn');
        var script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";
        script.async='true';
        script.charset='utf-8';
        document.head.appendChild(script);
      }
    })
  }

  async function onClickReroll(){
    validateSignSend(1)
  }
  
  async function onClickRename(){
    validateSignSend(2)
  }

  async function onClickBackstory(){
    validateSignSend(3)
  }

  // sets process Title
  function setPTitle(title) {
    gid('main-h').innerHTML=title;

  }
};main()
////////////////////////////////////////////////////////////////////////
// These functions below are purely convenience dom manipulation methods
///////////////////////////////////////////////////////////////////////
function enable(id){
  gid(id).disabled='';
}
function disable(id){
  gid(id).disabled='true';
}
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
