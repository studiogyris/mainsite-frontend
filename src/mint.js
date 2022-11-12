import * as Web3 from "@solana/web3.js";
import { CFG } from "./config.js";
import * as anchor from "@project-serum/anchor";
import { Metaplex, mintFromCandyMachineBuilder ,walletAdapterIdentity} from "@metaplex-foundation/js";

const constants = {
  networkConstants: {
    CANDY_MACHINE_PROGRAM: new anchor.web3.PublicKey(
      "CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR"
    ),
    TOKEN_METADATA_PROGRAM_ID: new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    ),
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: new anchor.web3.PublicKey(
      "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
    ),
    DEFAULT_TIMEOUT: 22000,
  },
  LAMPORTS_PER_SOL: 1000000000,
};

// ********[ Entry function ]*******
async function main() {
  // personal convenience object
  var bag = {
    sol: {},
    submittedTxsAmount: 0,
    staticInfoInitialized: false,
    cmState: {},
    balances: {
      sol: {},
      WLToken: undefined,
    },
  };

  while (!connectRpc()) {
    setPTitle("Trying to establish connection to an RPC endpoint...");
    await sleep("1000");
  }

  onRPCConnected();

  // returns true/false based on an attempt to create an RPC connection and save it in bag.sol.provider
  function connectRpc() {
    var success = true;
    try {
      const connection = new Web3.Connection(CFG.rpcUrl);
      bag.mx = Metaplex.make(connection);
      bag.sol.provider = new anchor.Provider(
        connection,
        {},
        {
          preflightCommitment: "recent",
        }
      );
    } catch (err) {
      console.error(err);
      success = false;
    }
    return success;
  }
  // function that gets called when RPC endpoint is successfully connected
  async function onRPCConnected() {
    reflectState();
    bag.stateUpdateInterval = setInterval(reflectState, 3000);
  }
  // gets UNIX timestamp
  const getUnixTs = () => {
    return new Date().getTime() / 1000;
  };
  // transaction that gets called when last transaction was a success
  async function mintSuccessCallback(txid) {
    gid("total-minted").textContent =
      parseInt(gid("total-minted").textContent) + 1;
    gid("minted-amount").textContent =
      parseInt(gid("minted-amount").textContent) + 1;
    gid("tx-" + txid).textContent = "[ Confirmed! ]";
    gid("tx-" + txid).style.color = "lightgreen";
    bag.cmState.itemsLeft--;
    bag.cmState.itemsSold++;
    clog("successCallback");
    if (bag.cmState.itemsLeft == 0) {
      setState(3);
    }
    if (!bag.cmState.currentState == 2) {
      bag.balances.WLToken--;
    }
  }
  // function that gets called when last transaction was a fail
  async function mintFailCallback(txid) {
    gid("tx-" + txid).textContent = "[ Failed! ]";
    gid("tx-" + txid).style.color = "red";
  }
  // promise version of sleep
  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // fetches and updates candy machine state variables and constants
  async function updateCMStateVars() {
    bag.cmState.raw = await fetchCMState();

    bag.cmState.totalItems = bag.cmState.raw.data.itemsAvailable;
    const fetchedItemsSold = parseInt(bag.cmState.raw.itemsRedeemed.toString());

    if (!bag.cmState.itemsSold || bag.cmState.itemsSold < fetchedItemsSold) {
      bag.cmState.itemsSold = fetchedItemsSold;
    }
    bag.cmState.itemsLeft = bag.cmState.totalItems - bag.cmState.itemsSold;

    return;
  }
  // returns milliseconds till either public or whitelist sale
  // returned positive number means the date is in future

  // fetches state and reflects on the UI
  async function reflectState() {
    await updateCMStateVars();
    const { totalItems, itemsSold } = bag.cmState;

    if (!bag.staticInfoInitialized) {
      editext("total-items-amount", 3056 + parseInt(totalItems) );
      bag.candyMachine = await bag.mx
        .candyMachines()
        .findByAddress({ address: new Web3.PublicKey(CFG.CMID) });

      //console.log(bag.candyMachine)

      const priceSOL =
        bag.candyMachine.candyGuard.guards.solPayment.amount.basisPoints / 1e9;
      editext("price", priceSOL.toFixed(decimalCount(priceSOL)) + " SOL"); //here
      clicksen("connect-btn", onClickConnect);
      bag.staticInfoInitialized = true;
    }
    editext("minted-amount", 3056 + parseInt(itemsSold) );

    const sign = bag.connectPressed ? 1 : -1;

    if (itemsSold >= totalItems) {
      // STATE: SOLD OUT
      setState(3);
    } else {
      setState(1 * sign);
    }
  }
  // changes UI elements based on the provided state number
  async function setState(state) {
    var cState = bag.cmState.currentState;

    if (state == cState) return; // NOTHING TO CHANGE

    if (state < 0) {
      // User has
      // Change the state number's sign and RETURN
      setPTitle("Connect your wallet to be able to Mint!");
      unhide("connect-btn");
    } else {
      switch (state) {
        case 0: // STATE: PRE WHITELIST
          displayIndependentSaleStatus("PRE-WL");
          break;
        case 1: // STATE WHITELIST SALE
          setPTitle("Choose the amount and click Mint!");
          unhide("mint-controls-form");
          break;
        case 2: // STATE: PUBLIC SALE
          setPTitle("Choose the amount and click Mint!");
          unhide("mint-controls-form");
          hide("connected-whitelisted-wrap");
          break;
        case 3: // STATE: SOLD
          clearInterval(bag.stateUpdateInterval);
          setPTitle(
            `Collection is sold out! :(<br> you can get one from <a href="${CFG.marketplaceCollection}" target="_blank">${CFG.marketplaceName}</a>`
          );
          hide("mint-controls-form");
          hide("connect-btn");
          break;
      }
    }

    if (state * state == 1) {
      displayIndependentSaleStatus("WL");
    } else if (state * state == 4) {
      displayIndependentSaleStatus("PUB");
    }
    bag.cmState.currentState = state;
    return;
  }
  // responsible for the live countdown elements

  // based on current state modifies UI elements independently from user connection
  // only called by setState()
  function displayIndependentSaleStatus(saleState) {
    if (bag.ISS == saleState) return;
    if (saleState == "WL") {
      editext("mint-phase", "[ Mint open for Whitelisted members Only! ]");

      gid("mint-phase").parentElement.style.color = "cyan";
    } else if (saleState == "PUB") {
      editext("mint-phase", "[ Mint open for public! ]");
      gid("mint-phase").parentElement.style.color = "lightgreen";
    }
    bag.ISS = saleState;
  }
  const decimalCount = (num) => {
    // Convert to String
    const numStr = String(num);
    // String Contains Decimal
    if (numStr.includes(".")) {
      return numStr.split(".")[1].length;
    }
    // String Does Not Contain Decimal
    return 0;
  };

  // function called after clicking the connect button
  async function onClickConnect() {
    //await wallet.connect();
    const hasPhantom = window.solana && window.solana.isPhantom;
    const hasSolflare = window.solflare && window.solflare.isSolflare;

    disable("connect-btn");

    if (hasPhantom && hasSolflare) {
      // make user choose their wallet
      return showBothBtns();
    }
    if (hasPhantom) {
      attemptPhantom();
    } else if (hasSolflare) {
      attemptSolflare();
    } else {
      showBothBtns();
      displayErr(
        "No wallet extension found for either Phantom or Solflare.<br> Please install one of them and refresh this website.<br> Clicking on the above buttons will take you to corresponding webpages."
      );
    }
  }
  // function that gets called when mint button is pressed
  async function onClickMintSingle() {
    const { candyMachine } = bag;

    clearErr();
    disable("mint-amount");

    const amount = gid("mint-amount").value;
    if (amount > 1) {
      displayMsg(
        `Please confirm all ${amount} mint transactions in your wallet!`
      );
    } else {
      displayMsg("Please confirm the transaction in your wallet!");
    }
    var cancelledAmount = 0;
    for (var i = 0; i < amount; i++) {
      const tx = await bag.mx
        .candyMachines()
        .mint(
          {
            candyMachine,
            collectionUpdateAuthority: bag.cmState.raw.authority,
            owner: bag.sol.walletProvider.publicKey,
          },
          {
            payer: bag.sol.walletProvider,
          }
        )
        .catch((err) => {
          console.error(err);
          return err;
        });

      clearErr();

      if (tx.code != undefined) {
        cancelledAmount++;
        if (amount > 1) {
          displayErr(
            `You have cancelled ${cancelledAmount}/${amount} mint transactions!`
          );
        } else {
          clearMsg();
          enable("mint-amount");
          return displayErr("You have cancelled a mint transaction!");
        }
      } else {
        clog(tx);
      }

      if (cancelledAmount == amount - 1 && amount > 1) {
        displayMsg(
          `Please confirm the last remaining mint transaction in your wallet!`
        );
      } else if (cancelledAmount > 0) {
        displayMsg(
          `Please confirm all ${
            amount - i - 1
          } remaining mint transactions in your wallet!`
        );
      } else {
        displayMsg(
          `Please confirm all ${
            amount - i - 1
          } mint transactions in your wallet!`
        );
      }
    }
    clearMsg();

    enable("mint-amount");
  }

  async function onClickMint() {
    
    clearErr();
    disable("mint-amount");
    
    
    gid('mint-btn').value='Waiting...';
    disable('mint-btn');

    const { candyMachine } = bag;
    const wallet = bag.sol.walletProvider;
    bag.mx.use(walletAdapterIdentity(wallet))

    

    const quantityString = parseInt(gid("mint-amount").value);

    if (quantityString > 1) {
      displayMsg(
        `Please confirm the transaction for all ${quantityString} mints`
      );
    } else {
      displayMsg("Please confirm the transaction in your wallet!");
    }

    var cancelledAmount = 0;

    try {
      const transactionBuilders = [];

      for (let index = 0; index < quantityString; index++) {
        transactionBuilders.push(
          await mintFromCandyMachineBuilder(bag.mx, {
            candyMachine,
            collectionUpdateAuthority: candyMachine.authorityAddress, // mx.candyMachines().pdas().authority({candyMachine: candyMachine.address})
            guards: {
              solPayment: bag.candyMachine.candyGuard.guards.solPayment,
            },
          })
        );
      }

      const blockhash = await bag.mx.rpc().getLatestBlockhash();

      const transactions = transactionBuilders.map((t) =>
        t.toTransaction(blockhash)
      );
      const signers = {};
      transactions.forEach((tx, i) => {
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockhash.blockhash;
        transactionBuilders[i].getSigners().forEach((s) => {
          if ("signAllTransactions" in s) signers[s.publicKey.toString()] = s;
          else if ("secretKey" in s) tx.partialSign(s);
          
          else if ("_signer" in s) tx.partialSign(s._signer);
        });
      });
      let signedTransactions = transactions;

      for (let signer in signers) {
        await signers[signer].signAllTransactions(transactions);
      }

      const output = await Promise.all(
        signedTransactions.map(async (tx, i) => {
          await sleep(50)
          return bag.mx
            .rpc()
            .sendAndConfirmTransaction(tx, { commitment: "finalized" })
            .then((tx) => ({
              ...tx,
              context: transactionBuilders[i].getContext(),
            }))
            ;
        })
      );

      
      
      
     
    } catch (error) {
      

      let message = error.msg || error.message || "Minting failed! Please try again!";
      if (!error.msg) {
        if (!error.message) {
          message = "Transaction Timeout! Please try again.";
        } else if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `Oh noo, looks like the collection is now fully sold out :(`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        } 
      } else {
        if (error.code === 311) {
          message = `Oh noo, looks like the collection is now fully sold out :(`;
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        } 
      }
      if (error.code === 4001 ) {
        message = 'You have cancelled the transaction request'
      }

      displayErr(message)
      console.error(error);
      
    } 
    enable("mint-amount");
    enable('mint-btn');
    gid('mint-btn').value='MINT';
    clearMsg();

   
    return;



    // // //
    for (var i = 0; i < amount; i++) {
      const tx = await bag.mx
        .candyMachines()
        .mint(
          {
            candyMachine,
            collectionUpdateAuthority: bag.cmState.raw.authority,
            owner: bag.sol.walletProvider.publicKey,
          },
          {
            payer: bag.sol.walletProvider,
          }
        )
        .catch((err) => {
          console.error(err);
          return err;
        });

      clearErr();

      if (tx.code != undefined) {
        cancelledAmount++;
        if (amount > 1) {
          displayErr(
            `You have cancelled ${cancelledAmount}/${amount} mint transactions!`
          );
        } else {
          clearMsg();
          enable("mint-amount");
          return displayErr("You have cancelled a mint transaction!");
        }
      } else {
        clog(tx);
      }

      if (cancelledAmount == amount - 1 && amount > 1) {
        displayMsg(
          `Please confirm the last remaining mint transaction in your wallet!`
        );
      } else if (cancelledAmount > 0) {
        displayMsg(
          `Please confirm all ${
            amount - i - 1
          } remaining mint transactions in your wallet!`
        );
      } else {
        displayMsg(
          `Please confirm all ${
            amount - i - 1
          } mint transactions in your wallet!`
        );
      }
    }
    clearMsg();

    enable("mint-amount");
  }
  // hides message box
  function clearMsg() {
    hide("display-msg-wrap");
  }
  // hides error message
  function clearErr() {
    hide("err-wrap");
  }

  // displays both wallet providers if both extensions are found
  async function showBothBtns() {
    hide("connect-btn");
    setPTitle("Select your wallet provider!");

    const phantomBtn = creatE("a");
    phantomBtn.style["border-radius"] = "0px";
    phantomBtn.style["border"] = "2px solid black";
    phantomBtn.classList = "btn red-btn";
    phantomBtn.style["background-color"] = "purple";
    phantomBtn.style.color = "white";
    phantomBtn.textContent = "Phantom";
    phantomBtn.id = "phantom-btn";

    const solflareBtn = creatE("a");
    solflareBtn.style["border-radius"] = "0px";
    solflareBtn.style["border"] = "2px solid black";
    solflareBtn.classList = "btn red-btn";
    solflareBtn.style["background-color"] = "orange";
    solflareBtn.style.color = "black";
    solflareBtn.textContent = "Solflare";
    solflareBtn.id = "solflare-btn";

    insertAfter(gid("connect-btn"), phantomBtn);

    insertAfter(phantomBtn, solflareBtn);

    clicksen("phantom-btn", attemptPhantom);
    clicksen("solflare-btn", attemptSolflare);
  }
  // prompts phantom extension for wallet connection
  async function attemptPhantom() {
    if (!window.solana || !window.solana.isPhantom) {
      window.open("https://phantom.app", "_blank");
      return;
    }
    window.solana
      .connect()
      .then((res) => {
        clearErr();
        bag.sol.walletProvider = window.solana;
        onWalletConnected();
      })
      .catch((err) => {
        if (err.code && err.code == 4001) {
          console.error(err);
          displayErr("You have cancelled the wallet connection");
        } else if (err.message) {
          displayErr(err.message);
        } else {
          displayErr("Something went wrong!");
          console.error(err);
        }
      });
  }
  // prompts solflare extension for wallet connection
  async function attemptSolflare() {
    if (!window.solflare || !window.solflare.isSolflare) {
      window.open("https://solflare.com", "_blank");
      return;
    }
    const success = await window.solflare.connect();
    if (success) {
      clearErr();
      bag.sol.walletProvider = window.solflare;
      onWalletConnected();
    } else {
      displayErr("You have cancelled the wallet connection");
    }
  }
  // displays a red error
  function displayErr(msg) {
    gid("err-msg").innerHTML = msg;
    unhide("err-wrap");
  }
  // displays a green message
  function displayMsg(msg) {
    gid("display-msg").innerHTML = msg;
    unhide("display-msg-wrap");
  }
  // adds listeners to the mint controls (buttons)
  function addMintControlListeners() {
    gid("mint-btn").addEventListener("click", onClickMint);
    gid("mint-amount").addEventListener("input", onInputMintAmount);
    document
      .getElementsByClassName("mint-amount-control")[0]
      .addEventListener("click", onInputMintAmount);
    document
      .getElementsByClassName("mint-amount-control")[1]
      .addEventListener("click", onInputMintAmount);
    gid("mint-amount").addEventListener("focusout", onFocusOutMintAmount);
    gid("max-btn").addEventListener("click", onClickMaxBtn);
  }
  // helper function for input element sanitization
  function onFocusOutMintAmount() {
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (!v) {
      inputE.value = 1;
    }
  }
  // function that gets called when input elements receives changes
  function onInputMintAmount() {
    const inputE = gid("mint-amount");
    const v = inputE.value;
    if (v < 0 || v === 0) {
      inputE.value = 1;
    }
    if (bag.cmState.currentState == 2) {
      if (v > CFG.maxPerTx || v > bag.cmState.itemsLeft) {
        inputE.value =
          CFG.maxPerTx < bag.cmState.itemsLeft
            ? CFG.maxPerTx
            : bag.cmState.itemsLeft;
      }
    } else {
      if (v > bag.balances.WLToken || v > bag.cmState.itemsLeft) {
        inputE.value =
          bag.balances.WLToken < bag.cmState.itemsLeft
            ? bag.balances.WLToken
            : bag.cmState.itemsLeft;
      }
    }
  }
  // function that gets called when max button is clicked
  function onClickMaxBtn() {
    if (bag.cmState.currentState == 2) {
      gid("mint-amount").value =
        CFG.maxPerTx < bag.cmState.itemsLeft
          ? CFG.maxPerTx
          : bag.cmState.itemsLeft;
    } else {
      gid("mint-amount").value =
        bag.balances.WLToken < bag.cmState.itemsLeft
          ? bag.balances.WLToken
          : bag.cmState.itemsLeft;
    }
  }
  // shortens the public address
  function shortenAddress(address, chars = 4) {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
  // function that gets called after wallet connection has been done for the first time
  async function onWalletConnected() {
    setState(bag.cmState.currentState * -1);
    hide("connect-btn");
    try {
      hide("solflare-btn");
      hide("phantom-btn");
    } catch (er) {}

    //unhide('connected-account-wrap');
    addMintControlListeners();
    editext(
      "connected-account",
      shortenAddress(bag.sol.walletProvider.publicKey.toString())
    );
    reflectAccountStatus();
    bag.connectPressed = true;

    // listens for accounts changes and prompts connection if detected
    setInterval(async function () {
      if (!bag.sol.walletProvider.publicKey) {
        await bag.sol.walletProvider.connect()
        editext(
          "connected-account",
          shortenAddress(bag.sol.walletProvider.publicKey.toString())
        );
      }
    }, 300);

    // checks and reflects sol and wl token balances
    setInterval(async function () {
      reflectAccountStatus();
    }, 1000);
  }
  // reflects account balances on the UI
  async function reflectAccountStatus() {
    if (!bag.sol.walletProvider.publicKey) {
      await bag.sol.walletProvider.connect()
    }

    updateMaxMints();
  }
  // determines and reflects the allowed amount of mints
  async function updateMaxMints() {
    if (bag.cmState.currentState == 2) {
      if (bag.cmState.itemsLeft < CFG.maxPerTx) {
        gid("max-per-tx").textContent = bag.cmState.itemsLeft;
      } else {
        gid("max-per-tx").textContent = CFG.maxPerTx;
      }
    } else {
      if (bag.cmState.itemsLeft < bag.balances.WLToken) {
        gid("max-per-tx").textContent = bag.cmState.itemsLeft;
      } else {
        gid("max-per-tx").textContent = bag.balances.WLToken;
      }
    }
  }

  // fetches the state of the candymachine and returns it
  async function fetchCMState() {
    if (!bag.sol.provider) {
      alert("No provider found, something wrong");
      return;
    }
    const idl = await anchor.Program.fetchIdl(
      constants.networkConstants.CANDY_MACHINE_PROGRAM,
      bag.sol.provider
    );

    if (idl) {
      const program = new anchor.Program(
        idl,
        constants.networkConstants.CANDY_MACHINE_PROGRAM,
        bag.sol.provider
      );

      bag.sol.candyMachineProgram = program;

      return await program.account.candyMachine.fetch(CFG.CMID);
    } else {
      console.error("No Idl, shouldn't happen");
    }
  }
  // sets process Title
  function setPTitle(title) {
    gid("main-h").innerHTML = title;
  }
}
main();
////////////////////////////////////////////////////////////////////////
// These functions below are purely convenience dom manipulation methods
///////////////////////////////////////////////////////////////////////
function enable(id) {
  gid(id).disabled = "";
}
function disable(id) {
  gid(id).disabled = "true";
}
function editext(id, text) {
  gid(id).textContent = text;
}
function clog(a) {
  console.log(a);
}
function creatE(a) {
  return document.createElement(a);
}
function hide(a) {
  gid(a).style.display = "none";
}
function unhide(a) {
  gid(a).style.display = "";
}
function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function gid(a) {
  return document.getElementById(a);
}
function clicksen(a, fn) {
  gid(a).addEventListener("click", fn);
}
