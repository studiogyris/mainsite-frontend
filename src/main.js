import * as Web3 from '@solana/web3.js';
// import Wallet from '@project-serum/sol-wallet-adapter';
import {CFG} from './config.js';
import * as anchor from '@project-serum/anchor';
import {TOKEN_PROGRAM_ID,MintLayout,Token} from  '@solana/spl-token';

//const LPS = 1000000000;
const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
    "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

const DEFAULT_TIMEOUT = 15000;




async function main(){
  var bag = {};
  bag.submittedTxsAmount = 0;
  window.sol = {};
  populateDom();
  if (!connectRpc()) {
    alert("RPC connection error");
    return;
  }
  onRPCConnected();
  fetchDisList();
  

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
  async function fetchDisList(){
    fetch("./dislist.json")
    .then(res => res.json())
    .then(data => bag.distList=data);
  }
  async function onRPCConnected() {

    bag.stateUpdateInterval = setInterval(updateState,3000);
    updateState();
  }
  const getUnixTs = () => {
    return new Date().getTime() / 1000;
  };
  async function mintSuccessCallback(txid){
    gid('total-minted').value=parseInt(gid('total-minted').value)+1;
    gid('tx-'+txid).textContent="[ Confirmed! ]";
    gid('tx-'+txid).style.color="lightgreen";
  }
  async function mintFailCallback(txid){
    gid('tx-'+txid).textContent="[ Failed! ]";
    gid('tx-'+txid).style.color="red";
  }
  async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function updateState() {
    const state = await getCMState();
    
    const formattedPrice = (state.price/1000000000).toFixed(2)
    editext('price',formattedPrice);
    if (state.itemsRedeemed>=CFG.totalItems) {
      clearInterval(bag.stateUpdateInterval);
      setPTitle(`Collection is sold out! :(<br> you can get one from <a href="${CFG.marketplaceCollection}" target="_blank">${CFG.marketplaceName}</a>`);
      hide('connect-btn');
    } else {
      const {goLiveDate} = state;
      const timeDelta = goLiveDate - Date.now();
      if (timeDelta) {
  
      } else {
        
      }
      
    }
    editext('minted-amount',state.itemsRedeemed)
  }
  function populateDom() {
    clicksen('connect-btn',onClickConnect);
    //editext('price',CFG.price);
    editext('max-per-tx',CFG.maxPerTx);
    editext('total-items-amount',CFG.totalItems);
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
  function enable(id){
    gid(id).disabled='';
  };
  function disable(id){
    gid(id).disabled='true';
  }
  async function onClickMint(){
    clearErr();
    disable('mint-amount');
    
    const amount = gid('mint-amount').value;
    if (amount>1) {
      displayMsg(`Please confirm all ${amount} mint transactions in your wallet!`);
    } else {
      displayMsg('Please confirm the transaction in your wallet!');
    }
    var cancelledAmount = 0;
    for (var i =0;i<amount;i++){
      const tx = await createSignSendAwait();
      clearErr();
      clog(tx);
      if (tx.length==0) {
        cancelledAmount++;
        if (amount>1) {
          displayErr(`You have cancelled ${cancelledAmount}/${amount} mint transactions!`);
        } else {
          clearMsg();
          enable('mint-amount');
          return displayErr("You have cancelled a mint transaction!");
        }
        
      }
      if (cancelledAmount==amount-1 && amount>1) {
        displayMsg(`Please confirm the last remaining mint transaction in your wallet!`);
      }
      else if (cancelledAmount>0) {
        displayMsg(`Please confirm all ${amount-i-1} remaining mint transactions in your wallet!`);
      } else {
        displayMsg(`Please confirm all ${amount-i-1} mint transactions in your wallet!`);
      }
      
    }
    clearMsg();
    
    enable('mint-amount');
  }
  function clearMsg(){
    hide('display-msg-wrap');
  }
  function clearErr(){
    hide('err-wrap');
  }
  async function createSignSendAwait(){
    const candyMachine = {
      'state': window.sol.candyMachineState,
      'id': CFG.CMID,
      'program': window.sol.candyMachineProgram
    }
    const candyMachineAddress = new anchor.web3.PublicKey(
      candyMachine.id
    );
    const mint = anchor.web3.Keypair.generate();
    const buyer = window.sol.walletProvider;
    const payer = buyer.publicKey;
    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey,payer))[0];


    const userPayingAccountAddress = candyMachine.state.tokenMint
    ? (await getAtaForMint(candyMachine.state.tokenMint, payer))[0]
    : payer;

    const remainingAccounts = [];
    const signers = [mint];
    
    const cleanupInstructions = [];
    const instructions = [
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports:
          await window.sol.candyMachineProgram.provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span,
          ),
        programId: TOKEN_PROGRAM_ID,
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        payer,
        payer,
      ),
      createAssociatedTokenAccountInstruction(
        userTokenAccountAddress,
        payer,
        payer,
        mint.publicKey,
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        userTokenAccountAddress,
        payer,
        [],
        1,
      ),
    ];
   

    if (candyMachine.state.data.whitelistMintSettings) {
      
      const mint = new anchor.web3.PublicKey(
        candyMachine.state.data.whitelistMintSettings.mint,
      );
  
      const whitelistToken = (await getAtaForMint(mint, payer))[0];
      remainingAccounts.push({
        pubkey: whitelistToken,
        isWritable: true,
        isSigner: false,
      });
  
      if (candyMachine.state.data.whitelistMintSettings.mode.burnEveryTime) {
        const whitelistBurnAuthority = anchor.web3.Keypair.generate();
  
        remainingAccounts.push({
          pubkey: mint,
          isWritable: true,
          isSigner: false,
        });
        remainingAccounts.push({
          pubkey: whitelistBurnAuthority.publicKey,
          isWritable: false,
          isSigner: true,
        });
        signers.push(whitelistBurnAuthority);
        const exists =
          await window.sol.candyMachineProgram.provider.connection.getAccountInfo(
            whitelistToken,
          );
        if (exists) {
          instructions.push(
            Token.createApproveInstruction(
              TOKEN_PROGRAM_ID,
              whitelistToken,
              whitelistBurnAuthority.publicKey,
              payer,
              [],
              1,
            ),
          );
          cleanupInstructions.push(
            Token.createRevokeInstruction(
              TOKEN_PROGRAM_ID,
              whitelistToken,
              payer,
              [],
            ),
          );
        }
      }
    }
    //
    if (candyMachine.state.tokenMint) {
      const transferAuthority = anchor.web3.Keypair.generate();

      signers.push(transferAuthority);
      remainingAccounts.push({
        pubkey: userPayingAccountAddress,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: transferAuthority.publicKey,
        isWritable: false,
        isSigner: true,
      });

      instructions.push(
        Token.createApproveInstruction(
          TOKEN_PROGRAM_ID,
          userPayingAccountAddress,
          transferAuthority.publicKey,
          payer,
          [],
          candyMachine.state.price.toNumber(),
        ),
      );
      cleanupInstructions.push(
        Token.createRevokeInstruction(
          TOKEN_PROGRAM_ID,
          userPayingAccountAddress,
          payer,
          [],
        ),
      );
    }
    const metadataAddress = await getMetadata(mint.publicKey);
    const masterEdition = await getMasterEdition(mint.publicKey);

  
    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
      candyMachineAddress,
    );

      //clog(candyMachine.state.wallet.toString())
     

    instructions.push(
      await window.sol.candyMachineProgram.instruction.mintNft(creatorBump, {
        accounts: {
          candyMachine: candyMachineAddress,
          candyMachineCreator,
          payer: payer.toString(),
          wallet: candyMachine.state.wallet,
          mint: mint.publicKey,
          metadata: metadataAddress,
          masterEdition,
          mintAuthority: payer.toString(),
          updateAuthority: payer.toString(),
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: Web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          recentBlockhashes: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts:
          remainingAccounts.length > 0 ? remainingAccounts : undefined,
      }),
    );
      
    try {
      return (
        await sendTransactions(
          candyMachine.program.provider.connection,
          window.sol.walletProvider,
          [instructions, cleanupInstructions],
          [signers, []],
          undefined,undefined,
          mintSuccessCallback,
          mintFailCallback

        )
      )
    } catch (e) {
      console.log(e);
    }

    return [];
  }
  async function sendTransactions (
    connection,
    wallet,
    instructionSet,
    signersSet,
    sequenceType,
    commitment,
    successCallback,
    failCallback,
    block
  ) {
   
    if (!wallet.publicKey) throw new Error();
  
    const unsignedTxns = [];
  
    if (!block) {
      block = await connection.getRecentBlockhash(commitment);
    }
  
    for (let i = 0; i < instructionSet.length; i++) {
      const instructions = instructionSet[i];
      const signers = signersSet[i];
  
      if (instructions.length === 0) {
        continue;
      }
  
      let transaction = new Web3.Transaction();
      instructions.forEach(instruction => transaction.add(instruction));
      transaction.recentBlockhash = block.blockhash;
      transaction.setSigners(
        // fee payed by the wallet owner
        wallet.publicKey,
        ...signers.map(s => s.publicKey),
      );
  
      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }
  
      unsignedTxns.push(transaction);
    }
  
    const signedTxns = await wallet.signAllTransactions(unsignedTxns);
    //alert('tx-submitted')
  
    const pendingTxns = [];
  
    let breakEarlyObject = { breakEarly: false, i: 0 };
    console.log(
      'Signed txns length',
      signedTxns.length,
      'vs handed in length',
      instructionSet.length,
    );
    for (let i = 0; i < signedTxns.length; i++) {
      const signedTxnPromise = sendSignedTransaction({
        connection,
        signedTransaction: signedTxns[i],
      });
      
      signedTxnPromise
        .then(({ failed,txid, slot }) => {
          if (failed) {
            failCallback(txid)
          } else {
            successCallback(txid, i);
          }
         
        })
        .catch(reason => {
          // @ts-ignore
          failCallback(signedTxns[i], i);
          if (false) {
            breakEarlyObject.breakEarly = true;
            breakEarlyObject.i = i;
          }
        });
  
     
        pendingTxns.push(signedTxnPromise);
      
    }
  
    return { number: signedTxns.length, txs:  Promise.all(pendingTxns) };
  };
  async function sendSignedTransaction({
    signedTransaction,
    connection,
    timeout = DEFAULT_TIMEOUT,
  }) {
    const rawTransaction = signedTransaction.serialize();
    const startTime = getUnixTs();
    let slot = 0;
    const txid = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight: true,
      },
    );
  
    console.log('Started awaiting confirmation for', txid);
    updateSubmittedTxs(txid);
  
    let done = false;
    (async () => {
      while (!done && getUnixTs() - startTime < timeout) {
        connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
        });
        await sleep(500);
      }
    })();
    var failed = false;
    try {
      const confirmation = await awaitTransactionSignatureConfirmation(
        txid,
        timeout,
        connection,
        'recent',
        true,
      );
     
  
      if (!confirmation)
        throw new Error('Timed out awaiting confirmation on transaction');
  
      if (confirmation.err) {
        console.error(confirmation.err);
        //return txid;
        throw new Error('Transaction failed: Custom instruction error');
      }
  
      slot = confirmation?.slot || 0;
    } catch (err) {
      failed=true;
      // throw new Error('Transaction failed');
      // console.error('Timeout Error caught', err);
      // if (err.timeout) {
      //   throw new Error('Timed out awaiting confirmation on transaction');
      // }
      // let simulateResult = null;
      // try {
      //   simulateResult = (
      //     await simulateTransaction(connection, signedTransaction, 'single')
      //   ).value;
      // } catch (e) { }
      // if (simulateResult && simulateResult.err) {
      //   if (simulateResult.logs) {
      //     for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
      //       const line = simulateResult.logs[i];
      //       if (line.startsWith('Program log: ')) {
      //         throw new Error(
      //           'Transaction failed: ' + line.slice('Program log: '.length),
      //         );
      //       }
      //     }
      //   }
      //   throw new Error(JSON.stringify(simulateResult.err));
      // }
      // // throw new Error('Transaction failed');
    } finally {
      done = true;
    }
   
    console.log('Latency', txid, getUnixTs() - startTime);
    return { failed, txid, slot };
  }
  async function awaitTransactionSignatureConfirmation  (
    txid,
    timeout,
    connection,
    commitment = 'recent',
    queryStatus = false,
  ) {
    let done = false;
    let status = {
      slot: 0,
      confirmations: 0,
      err: null,
    };
    let subId = 0;
    status = await new Promise(async (resolve, reject) => {
      setTimeout(() => {
        if (done) {
          return;
        }
        done = true;
        console.log('Rejecting for timeout...');
        reject({ timeout: true });
      }, timeout);
      while (!done && queryStatus) {
      
        (async () => {
          try {
            const signatureStatuses = await connection.getSignatureStatuses([
              txid,
            ]);
            status = signatureStatuses && signatureStatuses.value[0];
            if (!done) {
              if (!status) {
                console.log('REST null result for', txid, status);
              } else if (status.err) {
                console.log('REST error for', txid, status);
               
                done = true;
                reject(status.err);
              } else if (!status.confirmations) {
                console.log('REST no confirmations for', txid, status);
              } else {
                console.log('REST confirmation for', txid, status);
                done = true;
                resolve(status);
              }
            }
          } catch (e) {
            if (!done) {
              console.log('REST connection error: txid', txid, e);
            }
          }
        })();
        await sleep(2000);
      }
    });
  
    if (connection._signatureSubscriptions[subId]) {
      connection.removeSignatureListener(subId);
    }
    done = true;
    console.log('Returning status', status);
    return status;
  };
  async function getMetadata (mint) {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };
  async function getMasterEdition (mint) {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  };
  async function getCandyMachineCreator (candyMachine) {

    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachine.toBuffer()],
      CANDY_MACHINE_PROGRAM,
    );
  };
  function createAssociatedTokenAccountInstruction (
    associatedTokenAddress,
    payer,
    walletAddress,
    splTokenMintAddress
  )  {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
      {
        pubkey: anchor.web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new anchor.web3.TransactionInstruction({
      keys,
      programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });
  };
  async function getAtaForMint(mint, buyer) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    );
  }
  async function updateSubmittedTxs(txid) {
    unhide('submitted-transactions-h');
    bag.submittedTxsAmount++;
    const subTxsWrap = gid('submitted-transactions-wrap');
    const li = document.createElement('div');
    const formattedTxid = txid.slice(0,5) + "....." + txid.substr(txid.length - 5);
    const devnetAppend = CFG.devnet ? '?cluster=devnet' : '';
    li.innerHTML = `1) Transaction #${bag.submittedTxsAmount} <a target="_blank" href="https://explorer.solana.com/tx/${txid}${devnetAppend}">${formattedTxid}</a>&nbsp&nbsp<span style="color:orange;" id="tx-${txid}">[ Waiting... ]</span> `;
    subTxsWrap.appendChild(li);
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
  function displayMsg(msg) {
    gid('display-msg').innerHTML=msg;
    unhide('display-msg-wrap');
  }
  function hideErr(){
    hide('err-wrap');
  }
  function addMintControlListeners(){
    gid('mint-btn').addEventListener('click',onClickMint);
    gid('mint-amount').addEventListener('input', onInputMintAmount);
    document.getElementsByClassName('mint-amount-control')[0].addEventListener("click",onInputMintAmount);
    document.getElementsByClassName('mint-amount-control')[1].addEventListener("click",onInputMintAmount);
    gid("mint-amount").addEventListener('focusout',onFocusOutMintAmount);
    gid("max-btn").addEventListener('click',onClickMaxBtn);
  }
  function onFocusOutMintAmount(){
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (!v){
      inputE.value=1;
    }
  }
  function onInputMintAmount(){
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (v<0 || v===0){
      inputE.value=1;
    }
    if ( v>CFG.maxPerTx){
      inputE.value=CFG.maxPerTx;
    }
  }
  function onClickMaxBtn() {
    gid("mint-amount").value=CFG.maxPerTx;
  }
  function shortenAddress (address, chars = 4) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };
  async function onWalletConnected(){
    setPTitle("Choose the amount and press mint!");
    unhide('mint-controls-form');
    hide('connect-btn');
    addMintControlListeners();
    unhide('connected-account-wrap');
    editext('connected-account',shortenAddress(window.sol.walletProvider.publicKey.toString()))
    const accountChangeListenerInterval = setInterval(async function() {
      if (!window.sol.walletProvider.publicKey) {
        await window.solana.connect();
       
      }
      updateUserBalance();
      checkIfWhitelisted();
      
      editext('connected-account',shortenAddress(window.sol.walletProvider.publicKey.toString()))
    }, 325);
    try {
      hide('solflare-btn');
      hide('phantom-btn');
    } catch {}

    testsAfterConnection();
  }
  async function updateUserBalance(){
    const balance = await getUserBalance();
    const formattedBalance = (balance/1000000000).toFixed(2)
    editext('user-balance',formattedBalance + " SOL");
  }
  async function checkIfWhitelisted(){
    if (!bag.distList) {
      return console.error("Shouldn't happen #1");
    }
    var isWhitelisted = false;
    try {
      
      for (var obj of bag.distList){
        if (obj.handle==window.sol.walletProvider.publicKey.toString()) {
          isWhitelisted = true;
        break;
        }
      }
    } catch (err) {
      console.error(err)
    }
    if (isWhitelisted) {
      editext('connected-whitelisted',"Whitelisted");
    } else {
      editext('connected-whitelisted',"Not Whitelisted");
    }
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

      window.sol.candyMachineProgram = program;
        
      const state = await program.account.candyMachine.fetch(
          CFG.CMID
      );
      window.sol.candyMachineState = state;
      const itemsAvailable = state.data.itemsAvailable.toNumber();
      const itemsRedeemed = state.itemsRedeemed.toNumber();
      const itemsRemaining = itemsAvailable - itemsRedeemed;
      const price = state.data.price;
      
      let goLiveDate = state.data.goLiveDate.toNumber();
      goLiveDate = new Date(goLiveDate * 1000);

      return {
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        goLiveDate,
        price
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
