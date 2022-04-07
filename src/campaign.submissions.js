import {CFG} from './config.js';


// ********[ Entry function ]*******
async function main(){
  const mapping = await fetch('/campaign/mapping.json').then((res)=>{
    return res.json()})
  if (window.location.search!=''){
    const buraidtoshow = window.location.search.split('=')[1];
    hide('fetch-controls');
    onClickFetch(buraidtoshow);
    setPTitle('Displaying submissions for Bura #'+buraidtoshow)
    hide('id-sign')
  } else {
    

    gid('fetch-btn').addEventListener('click',onClickFetch);
    gid('input-buraid').addEventListener('input', onInputBuraID);
  }

  if (window.screen.width<900) {
      
    gid('text-backstory').style.width=window.screen.width*9/10+'px';
  }
  
  

  clicksen('back-btn',onClickBack);
  
  
  function onClickBack() {
    window.location.href='..';
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

  async function onClickFetch(buid){
    
    var buraID
    if (typeof(buid)=='string') {
      buraID = buid;
    } else {
      buraID = gid('input-buraid').value;
    }
    

    if (buraID == '' || isNaN(buraID) || parseInt(buraID)<0 || parseInt(buraID)>2734 ) {
      displayErr('Please input correct BuraID');
      return;
    }

    if (!mapping[buraID]) {
      displayErr("This Bura hasn't been minted yet");
      return;
    }
    clearErr();
    
    const url = CFG.backendURL +'/campaign/submissions?buraid='+buraID;


    gid('fetch-btn').value='Waiting...'
    fetch(url)
    .then((res)=>{
      return res.json();
    })
    .then((res)=>{
      console.log(res);
      
      gid('fetch-btn').value='Fetch';
      
      if (res.code<0){
        displayErr(res.message)
      } else {
        unhide('fetched-info')
        displayFetchedData(res.data);
      }
    })
    
  }
  
  function displayFetchedData(data) {
    if (data.reroll==false) {
      editext('reroll-bool','NO');
      gid('reroll-bool').style.color='yellow'
    } else {
      editext('reroll-bool','YES');
      gid('reroll-bool').style.color='lightgreen'
    }

    if (data.name==null) {
      gid('input-name').value="The owner hasn't set a name";
    } else {
      gid('input-name').value=data.name;
    }

    if (data.backstory==null) {
      gid('text-backstory').value="The owner hasn't added a backstory yet";
    } else {
      gid('text-backstory').value=data.backstory;
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
