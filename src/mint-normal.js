import * as Web3 from '@solana/web3.js';
import {CFG} from './config.js';
import * as anchor from '@project-serum/anchor';
import {TOKEN_PROGRAM_ID,MintLayout,Token} from  '@solana/spl-token';


const constants = {
  networkConstants: {
      CANDY_MACHINE_PROGRAM:  new anchor.web3.PublicKey(
          "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ"
      ),  
      TOKEN_METADATA_PROGRAM_ID: new anchor.web3.PublicKey(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
      ),
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: new anchor.web3.PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
      ),
      DEFAULT_TIMEOUT : 22000
  },
  LAMPORTS_PER_SOL: 1000000000
}


// ********[ Entry function ]*******
async function main(){
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
  
  // function that gets called to update the WL token balance
  async function updateWhitelistTokenBalance(){
    var data =
            await bag.sol.provider.connection.getParsedTokenAccountsByOwner(
              bag.sol.walletProvider.publicKey,
              { mint: bag.cmState.raw.data.whitelistMintSettings.mint }
            );

    var tokenAmount;
    if (!data.value.length) {
      tokenAmount = 0;
    } else {
      tokenAmount = data.value[0].account.data.parsed.info.tokenAmount.amount;
    }
    
    bag.balances.WLToken = parseInt(tokenAmount);
    editext('connected-whitelisted',`${bag.balances.WLToken} WL tokens`);
    if (tokenAmount==0) onNoWLTokensLeft();

  }
  // function that gets executed when last WL token is used
  async function onNoWLTokensLeft() {
    setPTitle(`You have no whitelist tokens!<br>Come back during public Mint.`);
    hide('mint-controls-form');
  }
  // gets lamports in currently connected wallets account
  async function getUserBalance() {
    return await bag.sol.provider.connection.getBalance(bag.sol.walletProvider.publicKey);
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
    reflectState();
    bag.stateUpdateInterval = setInterval(reflectState,3000);
  }
  // gets UNIX timestamp
  const getUnixTs = () => {
    return new Date().getTime() / 1000;
  }
  // transaction that gets called when last transaction was a success
  async function mintSuccessCallback(txid){
    gid('total-minted').textContent=parseInt(gid('total-minted').textContent)+1;
    gid('minted-amount').textContent=parseInt(gid('minted-amount').textContent)+1;
    gid('tx-'+txid).textContent="[ Confirmed! ]";
    gid('tx-'+txid).style.color="lightgreen";
    bag.cmState.itemsLeft--;
    bag.cmState.itemsSold++;
    clog('successCallback')
    if (bag.cmState.itemsLeft==0) {
      setState(3);
    }
    if (!bag.cmState.currentState == 2) {
      bag.balances.WLToken--;
    }
  }
  // function that gets called when last transaction was a fail
  async function mintFailCallback(txid){
    gid('tx-'+txid).textContent="[ Failed! ]";
    gid('tx-'+txid).style.color="red";
  }
  // promise version of sleep
  async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // updates countdown to public mint
  async function updateCountDown() {
    const {goLiveDate} = bag.cmState;

    const timeDelta = (goLiveDate - Date.now())/1000 ; // <---remove last added part after minus sign
    var hours   = Math.floor(timeDelta / 3600);
    var minutes = Math.floor((timeDelta - (hours * 3600)) / 60);
    var seconds = (timeDelta - (hours * 3600) - (minutes * 60)).toFixed(0);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if (parseInt(hours+minutes+seconds)==0) {
      reflectState();
    }
    
    editext('countdown','['+hours+':'+minutes+':'+seconds+']');
  }
  // fetches and updates candy machine state variables and constants
  async function updateCMStateVars(){
    bag.cmState.raw = await fetchCMState();
    bag.cmState.totalItems = bag.cmState.raw.data.itemsAvailable.toNumber();
    const fetchedItemsSold = bag.cmState.raw.itemsRedeemed.toNumber();
    if ( !bag.cmState.itemsSold || bag.cmState.itemsSold<fetchedItemsSold ) {
      bag.cmState.itemsSold = fetchedItemsSold;
    }
    bag.cmState.itemsLeft = bag.cmState.totalItems -  bag.cmState.itemsSold;
    bag.cmState.price = bag.cmState.raw.data.price;
    bag.cmState.formattedPrice = (bag.cmState.price/1000000000).toFixed(2);
    bag.cmState.goLiveDate = new Date(bag.cmState.raw.data.goLiveDate.toNumber() * 1000);
    const whiteListDateTS = Date.parse(bag.cmState.goLiveDate) - CFG.fromWLtoPublic;
    bag.cmState.WLDate= new Date(whiteListDateTS);
    return;
  }
  // returns milliseconds till either public or whitelist sale
  // returned positive number means the date is in future
  function getTimeDelta(sale = 'PUB',mode = 'ms') {
    const date = sale == 'WL' ? bag.cmState.WLDate : bag.cmState.goLiveDate;
    const timeDeltaMs = date  - Date.now();
    if (mode=='ms') {
      return timeDeltaMs;
    } else if ( mode =='s' ){
      return timeDeltaMs/1000;
    } else if (mode== 'm') {
      return timeDeltaMs/60000;
    } else if (mode=='h') {
      return timeDeltaMs/3600000;
    }
    
  }
  // fetches state and reflects on the UI
  async function reflectState() {
    await updateCMStateVars();
    const {
      totalItems,
      itemsSold,
      itemsLeft,
      price,
      goLiveDate,
      formattedPrice
    } = bag.cmState;
    
    if (!bag.staticInfoInitialized) {
      editext('total-items-amount',totalItems);
      editext('price',formattedPrice);//here
      clicksen('connect-btn',onClickConnect);
      bag.staticInfoInitialized=true;
    }
    editext('minted-amount',itemsSold);

    const sign = bag.connectPressed ? 1 : -1;

    if (itemsSold>=totalItems) {
      // STATE: SOLD OUT
      setState(3);
    } else if (getTimeDelta('PUB') < 0) {
      // STATE: PUBLIC SALE
      setState(2*sign);
    } else if (getTimeDelta('WL') < 0) {
      // STATE: WHITELIST SALE
      setState(1*sign);
    } else {
      // STATE: PRE WHITELIST
      setState(0);
    } 
  }
  // changes UI elements based on the provided state number
  async function setState(state){
    var cState = bag.cmState.currentState;

    if (state==cState) return; // NOTHING TO CHANGE
    
    if (state<0) {
      // User has
      // Change the state number's sign and RETURN
      setPTitle("Connect your wallet to be able to Mint!");
      unhide('connect-btn');
    } else {
      switch(state) {
        case 0: // STATE: PRE WHITELIST
          displayIndependentSaleStatus('PRE-WL');
          break;
        case 1: // STATE WHITELIST SALE
          setPTitle("Choose the amount and click Mint!");
          unhide('mint-controls-form');
          break;
        case 2: // STATE: PUBLIC SALE
          setPTitle("Choose the amount and click Mint!");
          unhide('mint-controls-form');
          hide('connected-whitelisted-wrap');
          break;
        case 3: // STATE: SOLD 
          clearInterval(bag.stateUpdateInterval);
          setPTitle(`Collection is sold out! :(<br> you can get one from <a href="${CFG.marketplaceCollection}" target="_blank">${CFG.marketplaceName}</a>`);
          hide('mint-controls-form');
          hide('connect-btn');
          break;
      }
    }

    if (state*state == 1) {
      displayIndependentSaleStatus('WL');
    } else if (state*state == 4) {
      displayIndependentSaleStatus('PUB');
    }
    bag.cmState.currentState=state;
    return;
  }
  // responsible for the live countdown elements
  function updateWLCountdown(){
    const {WLDate} = bag.cmState;

    if ( ( WLDate-Date.now() )<0 || !gid('wl-countdown') ) return;

    const timeDelta = (WLDate - Date.now())/1000;
    var hours   = Math.floor(timeDelta / 3600);
    var minutes = Math.floor((timeDelta - (hours * 3600)) / 60);
    var seconds = (timeDelta - (hours * 3600) - (minutes * 60)).toFixed(0);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if (parseInt(hours+minutes+seconds)==0) {
      reflectState();
    }
    
    editext('wl-countdown',hours+':'+minutes+':'+seconds);
  }
  // based on current state modifies UI elements independently from user connection
  // only called by setState()
  function displayIndependentSaleStatus(saleState) {
    if (bag.ISS==saleState) return;
    if (saleState=='WL') {
      editext('mint-phase','[ Mint open for Whitelist members Only! ]');
      if (!bag.countDownInterval) {
        bag.countDownInterval = setInterval(updateCountDown,1000);
      }

      unhide('countdown');
      gid('mint-phase').parentElement.style.color='cyan';
    } else if (saleState=='PUB') {
      editext('mint-phase','[ Mint open for public! ]');
      gid('mint-phase').parentElement.style.color='lightgreen';
      hide('countdown');
    } else {
      setPTitle(`Whitelist minting starts in<br><span id="wl-countdown">00:00:00<span>`);
      setInterval(updateWLCountdown,1000);
    }
    bag.ISS=saleState;
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
  // function that gets called when mint button is pressed
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
  // hides message box
  function clearMsg(){
    hide('display-msg-wrap');
  }
  // hides error message
  function clearErr(){
    hide('err-wrap');
  }
  async function createSignSendAwait(){
    const candyMachine = {
      'state': bag.cmState.raw,
      'id': CFG.CMID,
      'program': bag.sol.candyMachineProgram
    }
    const candyMachineAddress = new anchor.web3.PublicKey(
      candyMachine.id
    );
    const mint = anchor.web3.Keypair.generate();
    const buyer = bag.sol.walletProvider;
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
          await bag.sol.candyMachineProgram.provider.connection.getMinimumBalanceForRentExemption(
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
          await bag.sol.candyMachineProgram.provider.connection.getAccountInfo(
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
      await bag.sol.candyMachineProgram.instruction.mintNft(creatorBump, {
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
          tokenMetadataProgram: constants.networkConstants.TOKEN_METADATA_PROGRAM_ID,
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
          bag.sol.walletProvider,
          [instructions, cleanupInstructions],
          [signers, []],
          1,'processed',
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
      
      // transaction.setSigners(
      //   // fee payed by the wallet owner
      //   wallet.publicKey,
      //   ...signers.map(s => s.publicKey),
      // );
      transaction.feePayer = wallet.publicKey;
     
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
        .then(({ skipCallback, failed,txid, slot }) => {
          if (failed) {
            if (!skipCallback) 
            failCallback(txid)
          } else {
            if (!skipCallback) 
            successCallback(txid, i);
            
          }
         
        })
        .catch(reason => {
          // @ts-ignore
          if (!skipCallback)  
          failCallback(signedTxns[i], i);
          if (false) {
            breakEarlyObject.breakEarly = true;
            breakEarlyObject.i = i;
          }
        });
  
     
        pendingTxns.push(signedTxnPromise);
      
    }
  
    return { number: signedTxns.length, txs:  Promise.all(pendingTxns) };
  }
  async function sendSignedTransaction({
    signedTransaction,
    connection,
    timeout = constants.networkConstants.DEFAULT_TIMEOUT,
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
    //console.log(signedTransaction);
    var skipCallback = false;
    console.log('Started awaiting confirmation for', txid);
    if (signedTransaction.signatures.length == 3) {
      updateSubmittedTxs(txid);
    } else {
      skipCallback = true;
    }
    
  
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
    return { skipCallback, failed, txid, slot };
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
  }
  async function getMetadata (mint) {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          constants.networkConstants.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        constants.networkConstants.TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  }
  async function getMasterEdition (mint) {
    return (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          constants.networkConstants.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
          Buffer.from('edition'),
        ],
        constants.networkConstants.TOKEN_METADATA_PROGRAM_ID,
      )
    )[0];
  }
  async function getCandyMachineCreator (candyMachine) {

    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachine.toBuffer()],
      constants.networkConstants.CANDY_MACHINE_PROGRAM,
    );
  }
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
      programId: constants.networkConstants.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    });
  }
  async function getAtaForMint(mint, buyer) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      constants.networkConstants.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    );
  }
  // displays the last submitted transaction
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
  // adds listeners to the mint controls (buttons)
  function addMintControlListeners(){
    gid('mint-btn').addEventListener('click',onClickMint);
    gid('mint-amount').addEventListener('input', onInputMintAmount);
    document.getElementsByClassName('mint-amount-control')[0].addEventListener("click",onInputMintAmount);
    document.getElementsByClassName('mint-amount-control')[1].addEventListener("click",onInputMintAmount);
    gid("mint-amount").addEventListener('focusout',onFocusOutMintAmount);
    gid("max-btn").addEventListener('click',onClickMaxBtn);
  }
  // helper function for input element sanitization
  function onFocusOutMintAmount(){
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (!v){
      inputE.value=1;
    }
  }
  // function that gets called when input elements receives changes
  function onInputMintAmount(){
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (v<0 || v===0){
      inputE.value=1;
    }
    if (bag.cmState.currentState == 2) {
      if ( v>CFG.maxPerTx || v>bag.cmState.itemsLeft){
        inputE.value=CFG.maxPerTx < bag.cmState.itemsLeft ? CFG.maxPerTx : bag.cmState.itemsLeft;
      }
    } else {
      if ( v>bag.balances.WLToken || v>bag.cmState.itemsLeft){
        inputE.value=bag.balances.WLToken < bag.cmState.itemsLeft ? bag.balances.WLToken : bag.cmState.itemsLeft;
      }
    }
    
  }
  // function that gets called when max button is clicked
  function onClickMaxBtn() {
    
    if (bag.cmState.currentState == 2) {
      gid("mint-amount").value=CFG.maxPerTx < bag.cmState.itemsLeft ? CFG.maxPerTx : bag.cmState.itemsLeft;
    } else {
      gid("mint-amount").value=bag.balances.WLToken < bag.cmState.itemsLeft ? bag.balances.WLToken : bag.cmState.itemsLeft;
    }
    
  }
  // shortens the public address
  function shortenAddress (address, chars = 4) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
  // function that gets called after wallet connection has been done for the first time
  async function onWalletConnected(){
    setState(bag.cmState.currentState*-1);
    hide('connect-btn');
    try {
      hide('solflare-btn');
      hide('phantom-btn');
    } catch (er){}
    
    unhide('connected-account-wrap');
    addMintControlListeners();
    editext('connected-account',shortenAddress(bag.sol.walletProvider.publicKey.toString()))
    reflectAccountStatus();
    bag.connectPressed = true;

    // listens for accounts changes and prompts connection if detected
    setInterval(async function() {
      if (!bag.sol.walletProvider.publicKey) {
        await bag.solana.connect();
        editext('connected-account',shortenAddress(bag.sol.walletProvider.publicKey.toString()))
      }
    }, 300);

    // checks and reflects sol and wl token balances
    setInterval(async function() {
      reflectAccountStatus();
    }, 1000);
  }
  // reflects account balances on the UI 
  async function reflectAccountStatus(){
    if (!bag.sol.walletProvider.publicKey) {
      await bag.solana.connect();
    }
    updateUserBalance();
    if (!(bag.cmState.currentState == 2)) {
      await updateWLStatus();
    }
    updateMaxMints();
    
  }
  // determines and reflects the allowed amount of mints
  async function updateMaxMints(){
    if (bag.cmState.currentState == 2) {
      if ( bag.cmState.itemsLeft < CFG.maxPerTx ) {
        gid('max-per-tx').textContent = bag.cmState.itemsLeft;
      } else {
        gid('max-per-tx').textContent = CFG.maxPerTx;
      }
    } else {
      if ( bag.cmState.itemsLeft < bag.balances.WLToken ) {
        gid('max-per-tx').textContent = bag.cmState.itemsLeft;
      } else {
        gid('max-per-tx').textContent = bag.balances.WLToken;
      }
      
    }
  }
  // fetches and updates the User's SOL balance
  async function updateUserBalance(){
    const balance = await getUserBalance();
    const formattedBalance = (balance/constants.LAMPORTS_PER_SOL).toFixed(2)
    bag.balances.sol.lamports=balance;
    bag.balances.sol.formatted-formattedBalance;
    editext('user-balance',formattedBalance + " SOL");
    return;
  }
  // reflects whitelist specific information on the UI
  async function updateWLStatus(){
    await updateWhitelistTokenBalance();
    
    if (  bag.balances.WLToken==0 ) {
      setPTitle(`You have no whitelist tokens!<br>Come back during public Mint.`);
      hide('mint-controls-form');
    } else if ( bag.cmState.itemsLeft ) {
      unhide('mint-controls-form');
      setPTitle("Choose the amount and press mint!");
    } else if ( bag.cmState.itemsLeft==0) {
      setState(3);
    } else {
      if (bag.timeDelta>0) {
        hide('mint-controls-form');
        setPTitle('This wallet is not whitelisted!<br>Please select the one that is or wait for public mint.');
      }
    }
    return;
  }
  // fetches the state of the candymachine and returns it
  async function fetchCMState() {
    if (!bag.sol.provider) {
      alert("No provider found, something wrong");
      return;
    }
    const idl = await anchor.Program.fetchIdl(constants.networkConstants.CANDY_MACHINE_PROGRAM, bag.sol.provider);

    if (idl) {
      const program = new anchor.Program(
          idl,
          constants.networkConstants.CANDY_MACHINE_PROGRAM,
          bag.sol.provider
      );

      bag.sol.candyMachineProgram = program;
        
      return await program.account.candyMachine.fetch(
          CFG.CMID
      );
    } else {
      console.error("No Idl, shouldn't happen");
    }
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
