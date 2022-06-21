async function main(){
    const pathn = window.location.pathname;
    var stats,allscores,nonvis,collectionName,subclassLimits;

    var isMobile = screen.width < 521 ? true : false;

   
    if (pathn.includes('bura')) {
        collectionName = 'bura';

        if (isMobile) {
            gid('item-img').src= `https://gyris-${collectionName}-350x350.b-cdn.net/123.jpg`
        } else {
            gid('item-img').src= `https://gyris-${collectionName}-800x800.b-cdn.net/123.jpg`
        }
    

        stats = await fetch('/drops/bura/statistics/index.json').then((res)=>{
            return res.json()})
    
        allscores = await fetch('/drops/bura/statistics/allscores.json').then((res)=>{
            return res.json()})

        subclassLimits = await fetch('/drops/bura/additional/subclasslimits.json').then((res)=>{
            return res.json()})

        nonvis = [
            'Strength',
            'Intelligence',
            'Wisdom',
            'Dexterity',
            'Resilience',
            'Charisma',
            'Height',
            'Base rating'
        ]

    } else if (pathn.includes('ogg')) {
        collectionName = 'ogg';

        stats = await fetch('/drops/ogg/statistics/index.json').then((res)=>{
            return res.json()})
    
        allscores = await fetch('/drops/ogg/statistics/allscores.json').then((res)=>{
            return res.json()})

        subclassLimits = await fetch('/drops/ogg/additional/subclasslimits.json').then((res)=>{
            return res.json()})

        nonvis = [
            'Strength',
            'Agility',
            'Endurance',
            'Synergy',
            'Resilience',
            'Base rating'
        ]
    } 
    
   

    gid('input-itemid').addEventListener('input', onInputItemID);
    clicksen('fetch-btn',onClickFetch);
   

    

    const tiers = {
        '-1':{
            'name':'none',
            'color': 'white'
        },
        '0':{
            'name':'Common',
            'color': 'grey'
        },
        '2':{
            'name':'Uncommon',
            'color': 'rgb(94, 255, 30)'
        },
        '5':{
            'name':'Rare',
            'color': 'rgb(38, 81, 224)'
        },
        '10':{
            'name':'Epic',
            'color': 'rgb(179, 65, 207)'
        },
        '25':{
            'name':'Legendary',
            'color': 'rgb(226, 167, 41)'
        },
        '100':{
            'name':'Divine',
            'color': 'rgb(255, 255, 255)'
        }
    }

    const bonuspoints = {
        '5/12':15,
        '12/12':25
    }

    const specialAttrs = ['Mahan Yura','The Old, the Gone, the Here and the Now','Chief Lap-Lap','Oo Na Gaiari','Moss','Akukani Bu-Raa-Nai']

    function onInputItemID(){
        const inputE = gid("input-itemid");
        const v = inputE.value;
        if (  v<0 || v===0 ){
          inputE.value="";
        } else if ( v>2734){
            inputE.value=2734;
        }
    }

    function precision(a) {
        if (!isFinite(a)) return 0;
        var e = 1, p = 0;
        while (Math.round(a * e) / e !== a) { e *= 10; p++; }
        return p;
      }
      function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }

    async function onClickFetch(){
        
        var totalScore = 10;
        id = gid('input-itemid').value
        if ( isNaN(id) || id=='' || id<0 || id===0 ){
            return
          } else if ( id>2734){
              return
            }
        unhide('extended')
        gid('title').textContent=capitalize(collectionName)+' #';
        hide('memorandum');
        unhide('nothing')
        gid('item-img').src='/img/giphy.gif';

        const ans = await fetch('/drops/'+collectionName + '/metadata/'+id+'.json')
        .then((res)=>{
           return res.json()
        })
        var r1 = false;
        while (r1==false) {
            try {
                if (isMobile) {
                
                    gid('item-img').src=`https://gyris-${collectionName}-350x350.b-cdn.net/${id}.jpg`
                } else {
                    gid('item-img').src=`https://gyris-${collectionName}-800x800.b-cdn.net/${id}.jpg`
                }
                await new Promise(r => setTimeout(r, 50));     
                r1 = true;
            } catch (err) {
                await new Promise(r => setTimeout(r, 50));  
            }
            
        }
      
        


        gid('view-original').href=`https://gyris-${collectionName}.b-cdn.net/${id}.jpg`
        
        

        gid('title-itemid').innerHTML=id;

        var noneCount = 0;


        for (attrObj of ans.attributes) {
            const tname = attrObj.trait_type
            if ( tname == "ID" ) continue;

           

            var tval = attrObj.value
            if (tval=='War Paint (Full skull)') {
                tval = 'War Paint (Full Skull)'
            }

            if (tname == "Memorandi I" ) {
                editext('memorandum-text',tval);
                hide('nothing');
                unhide('memorandum')
                continue;
            }
            
            var isNonvis = false;
            if (nonvis.includes(tname)) {
                isNonvis = true;
            }

            if (isNonvis) {
                 if (tname=='Base rating') {
                   
                    if (collectionName=='bura') {
                        if ( noneCount == 0 ) {
                            //12/12
                            totalScore+=bonuspoints['12/12']
                            //gid('traitcount-bonus').textContent=`[+${bonuspoints['12/12']}]`
                        } else if ( noneCount == 7 ){
                            //5/12
                            totalScore+=bonuspoints['5/12']
                            //gid('traitcount-bonus').textContent=`[+${bonuspoints['5/12']}]`
                        }
                    }


                    if (totalScore>100) {
                        totalScore=100
                    }
                    const vs = (totalScore/20).toFixed(1)
                    visrank = 1;
                    var samescoreAmountVis=0;

                    for (scr of allscores['vis']) {
                        if ((totalScore/20) < scr) {
                            
                            visrank++
                        } else if ( parseFloat((totalScore/20).toFixed(2))==scr ) {
                            samescoreAmountVis++;
                        } else {
                            break;
                        }
                    }
            
                    gid('vis-score').textContent=`${vs}/5`

                    var visBetterThan = 2735 - visrank - samescoreAmountVis;
                    var visMarginLeft  = visBetterThan / (2735/315)
                    var visWidth = samescoreAmountVis / (2735/315)
                    if ( visWidth < 7 ) visWidth = 7;
                    if (visMarginLeft > 307) visMarginLeft = 307;
                    gid('vis-bar').style['margin-left']= visMarginLeft +'px' 
                    gid('vis-bar').style.width= (visWidth ).toFixed(0) + 'px'
                    
                    gid("vis-better").textContent= (( (2735 - visrank - samescoreAmountVis + 1 ) / 2735 ) * 100).toFixed(1);
                    gid("vis-same").textContent= (( samescoreAmountVis / 2735 ) * 100).toFixed(1);
                    gid("vis-worse").textContent= (( (visrank - 1 ) / 2735 ) * 100).toFixed(1);
                   
                    var samescoreAmountNonvis = 0;

                    nonvisrank = 1
                    for (scr of allscores['nonvis']) {
                        if ((tval) < scr) {
                            nonvisrank++
                        } else if ( tval==scr ) {
                            samescoreAmountNonvis++;
                        } else {
                            break;
                        }
                    }
                    var samescoreAmountComb = 0;
                    combinedrank = 1
                    for (scr of allscores['combined']) {
                        if ((parseFloat(vs)+tval) < scr) {
                            combinedrank++
                        } else if ( (parseFloat(vs)+tval)==scr ) {
                            samescoreAmountComb++;
                        } else {
                            break;
                        }
                    }

                    gid('nonvis-score').textContent=`${tval.toFixed(1)}/5`

                    var nonvisBetterThan = 2735 - nonvisrank - samescoreAmountNonvis;
                    var nonvisMarginLeft  = nonvisBetterThan / (2735/315)
                    var nonvisWidth = samescoreAmountNonvis / (2735/315)
                    if ( nonvisWidth < 7 ) nonvisWidth = 7;
                    if (visMarginLeft > 307) visMarginLeft = 307;
                    gid('nonvis-bar').style['margin-left']= nonvisMarginLeft +'px';
                   
                    gid('nonvis-bar').style.width= (nonvisWidth ).toFixed(0) + 'px';
                    gid("nonvis-better").textContent= (( (2735 - nonvisrank - samescoreAmountNonvis + 1 ) / 2735 ) * 100).toFixed(1);
                    gid("nonvis-same").textContent= (( samescoreAmountNonvis / 2735 ) * 100).toFixed(1);
                    gid("nonvis-worse").textContent= (( (nonvisrank - 1 ) / 2735 ) * 100).toFixed(1);
                 
                } else {
                    gid('attr-val-'+tname).textContent=tval;
                    if (tname!='Height') {
                        const greenbar = gid('barwrap-'+tname.toLowerCase()).children[0];
                        const min = greenbar.style['margin-left'];
                        const minn = parseInt(min.split('p')[0])
                        greenbar.style.width = (tval * 2.4 - minn ).toFixed(0) + 'px';
                    }
                    
                }
                
            } else {
                if (tval == 'none' ) {
                    noneCount++;
                }
                const idp2 = tname.replace(/\s+/g, '-').toLowerCase();
                
                if (collectionName=='bura') {
                    if (tname=='Class') {
                        const className = tval.split(' ')[0];
                        const isYaru = tval.split(' ')[1] ? true : false;
                        gid('classname').textContent = subclassLimits.dictionary[subclassLimits.mapping[className]];
                        gid('isyaru').textContent = isYaru ? 'Yaru (Apprentice)' : 'Carved weapon'
                        const scl = subclassLimits.values[ (subclassLimits.mapping[className]).toFixed(0) ];

                        for (attrName in scl) {
                            
                            const greenbar = gid('barwrap-'+attrName.toLowerCase()).children[0]
                            const redbar = gid('barwrap-'+attrName.toLowerCase()).children[1]
                            const { max } = scl[attrName];
                            const { min } = scl[attrName];
                            greenbar.style['margin-left']=(min * 2.4).toFixed(0) + 'px';
                            redbar.style['margin-left']=(min* 2.40).toFixed(0) + 'px';
                            redbar.style.width=(max * 2.4 - min * 2.4).toFixed(0) + 'px';
                        }

                    }
                } else if (collectionName=='ogg') {
                    if (tname=="Type") {
                        const className = tval;
                        
                        gid('classname').textContent = className
                        gid('isyaru').textContent = subclassLimits.dictionary[subclassLimits.mapping[className]];
                        const scl = subclassLimits.values[ (subclassLimits.mapping[className]).toFixed(0) ];
                        

                        for (attrName in scl) {
                            
                            const greenbar = gid('barwrap-'+attrName.toLowerCase()).children[0]
                            const redbar = gid('barwrap-'+attrName.toLowerCase()).children[1]
                            const { max } = scl[attrName];
                            const { min } = scl[attrName];
                            greenbar.style['margin-left']=(min * 2.4).toFixed(0) + 'px';
                            redbar.style['margin-left']=(min* 2.40).toFixed(0) + 'px';
                            redbar.style.width=(max * 2.4 - min * 2.4).toFixed(0) + 'px';
                        }

                    }
                }
                

                const o = stats[tname][tval];
                const { score } = o;
                totalScore += score;
               
               
                if (tiers[score.toString()]['name']=="Divine"){
                   gid('visa-'+idp2).innerHTML=`<strong><i>${tval}</i></strong>`;
                } else {
                   gid('visa-'+idp2).textContent=tval;
                }
                var { color } = tiers[score.toString()]
                if ( specialAttrs.includes(tval) ) {
                    color = 'rgb(98, 63, 63)'
                }
                gid('visa-'+idp2).style.color=color;   
            }
        }  
    }
}main();


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
  