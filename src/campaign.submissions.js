import {CFG} from './config.js';


// ********[ Entry function ]*******
async function main(){
  var subs;
  var selectedCollection = 'bura'; 
  
  
  if (window.location.search!=''){
    const query = window.location.search.split('=');
    const collection = query[1].split('&')[0]
    const id = query[2];
    
    hide('step1')
    hide('step2')
    hide('select-genus')
    hide('fetch-controls');
    gid('e1').innerHTML='';
    gid('e2').innerHTML='';
    gid('select-genus').value=collection;
    selectedCollection=collection
    editext('other-subs-collection-name',capitalize(collection))
    onClickFetch(id);
    
    setPTitle(`Displaying submissions for ${selectedCollection} # ${id}`)
    hide('id-sign')
  } else {
    getAllSubmissions(selectedCollection);
    gid('select-genus').addEventListener('change',onCollectionSelected)
    gid('fetch-btn').addEventListener('click',onClickFetch);
    gid('input-id').addEventListener('input', onInputnftid);
  }

  if (window.screen.width<900) {
    gid('text-backstory').style.width=window.screen.width*9/10+'px';
  }
  
  
  

  clicksen('back-btn',onClickBack);
  
  
  function onClickBack() {
    window.location.href='..';
  }

  function onInputnftid(){
    const inputE = gid("input-id");
    const v = inputE.value;
    if (  v<0 || v===0 ){
      inputE.value="";
    } 
  }


  async function onCollectionSelected() {
   
    const selector = event.target;
    const collection = selector.value;
    hide('fetched-info')
    selectedCollection = collection;
    editext('other-subs-collection-name',capitalize(collection))
    getAllSubmissions(collection);
  }

  async function getAllSubmissions(collection) {
    
    await fetch(CFG.backendURL,{
      method:'POST',
      body: JSON.stringify({
        getSubmissions: true,
        collection
      })
    })
    .then((res)=>{
      return res.json();
    }).then((res)=>{
      
      subs = res.details
      fillOtherSubsTable()
     }
    )
    
  }

  async function fillOtherSubsTable(){
    const table = gid('subs-table');
    table.children[0].replaceChildren(table.children[0].children[0]);

    for (const sub of subs) {
      
      const tr = document.createElement('tr');


      td = document.createElement('td');
      td.innerHTML = `<a target="_blank" href="https://gyris.io/rarity/${selectedCollection}?id=${sub['id'] }"><span style='color: blue; font-size:120%'>${sub['id']}</span></a>`;sub['id'] 
      console.log(td.textContent)
      tr.appendChild(td)

      td = document.createElement('td');
      td.textContent = sub['name'] 
      tr.appendChild(td)

      var td = document.createElement('td');
      td.textContent = sub['backstory']
      tr.appendChild(td)


      table.children[0].appendChild(tr)
      
    }
  }
 

  async function onClickFetch(buid){
    if (!subs) {
      await getAllSubmissions(selectedCollection);
    }
    
    var nftid
    if (typeof(buid)=='string') {
      nftid = buid;
    } else {
      nftid = gid('input-id').value;
    }
    
  

    if (nftid == '' || isNaN(nftid) || parseInt(nftid)<0 ) {
      displayErr('Please input correct ID');
      return;
    }

    setPTitle(`<span style="color:red;font-size:110%;">D</span>isplaying submissions for ${selectedCollection} # ${nftid}`)
    
    clearErr();
    
    
    gid('twitter-wrap').innerHTML=`<a style="display:none;" id="twitter-btn" href="https://twitter.com/share?ref_src=twsrc%5Etfw"
        class="twitter-share-button" data-size="large"
        data-text="Check out the name and backstory for this ${capitalize(selectedCollection)} "
        data-via="Gyris_official" data-hashtags="LoreCampaignPart2" data-lang="en"
        data-dnt="true" data-show-count="true" target="_blank"
        onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;">Tweet</a>`


    fetchSubmission(nftid);
  }
  
  function findSubmissionByID(id){
    
    for (const sub of subs) {
      if (sub['id']==parseInt(id)) {
        return sub
      }
    }
    return null;
  }

  function capitalize(word) {
    const loweredCase = word.toLowerCase();
    return word[0].toUpperCase() + loweredCase.slice(1);
  }

  function fetchSubmission(nftid) {
    const data = findSubmissionByID(nftid);

    if (!data){
      hide('fetched-info')
      return displayErr(`No submission found for ${capitalize(selectedCollection)} #${nftid}`);
    }
   

    var script = document.createElement('script');
    script.src = "https://platform.twitter.com/widgets.js";
    script.async='true';
    script.charset='utf-8';
    script.id='twitter-script'
    gid('twitter-wrap').appendChild(script);
    
    
    

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

    unhide('fetched-info')
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