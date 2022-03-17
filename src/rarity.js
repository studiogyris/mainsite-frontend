async function main(){
    const stats = await fetch('/drops/bura/statistics/index.json').then((res)=>{
        return res.json()})
    gid('input-buraid').addEventListener('input', onInputBuraID);
    clicksen('fetch-btn',onClickFetch);
   

    const nonvis = [
        'Strength',
        'Intelligence',
        'Wisdom',
        'Dexterity',
        'Resilience',
        'Charisma',
        'Height',
        'Base rating'
    ]

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

    function onInputBuraID(){
        const inputE = gid("input-buraid");
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

    async function onClickFetch(){
        var totalScore = 5;
        id = gid('input-buraid').value
        if (  id<0 || id===0 ){
            return
          } else if ( id>2734){
              return
            }
        editext('main-h',`Displaying attributes for Bura #${id}`)
        gid('nonvis-attr-wrap').innerHTML=''
        gid('vis-attr-wrap').innerHTML=''
        const ans = await fetch('/drops/bura/metadata/'+id+'.json')
        .then((res)=>{
           return res.json()
        })

        gid('img-bura').src=`https://gyris-bura.b-cdn.net/${id}.jpg`
        
        const pp = creatE('div')
        pp.innerHTML="<br>"

        gid('vis-attr-wrap').appendChild(pp)
        var noneCount = 0;

        const tn = creatE('div')
        tn.innerHTML=`<strong style="font-size:120%">Trait count: &nbsp<span id='trait-count'>?</span>/12</strong>&nbsp<span id="traitcount-bonus"></span>`
        gid('vis-attr-wrap').appendChild(tn)
        gid('vis-attr-wrap').appendChild(creatE('br'))

        for (attrObj of ans.attributes) {
            const tname = attrObj.trait_type
            var tval = attrObj.value
            if (tval=='War Paint (Full skull)') {
                tval = 'War Paint (Full Skull)'
            }
            
            var isNonvis = false;
            if (nonvis.includes(tname)) {
                isNonvis = true;
            }

            const wrap = isNonvis ? gid('nonvis-attr-wrap') : gid('vis-attr-wrap')
            const d1 = creatE('div')
            

            if (isNonvis) {
                if (tname=='Resilience'){
                    d1.innerHTML = `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong>` + tname + '</strong>' + `<div style='color:red;'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +tval+'</div><br>'
                } else if (tname=='Base rating') {
                    clog(totalScore)
                    gid('trait-count').textContent=12-noneCount
                    if ( noneCount == 0 ) {
                        //12/12
                        totalScore+=bonuspoints['12/12']
                        gid('traitcount-bonus').textContent=`[+${bonuspoints['12/12']}]`
                    } else if ( noneCount == 7 ){
                        //5/12
                        totalScore+=bonuspoints['5/12']
                        gid('traitcount-bonus').textContent=`[+${bonuspoints['5/12']}]`
                    }
                    clog(totalScore)
                    gid('vis-score').textContent=totalScore
                    gid('nonvis-score').textContent=tval
                    clog(totalScore*parseFloat(tval))
                    gid('combined-score').textContent=(totalScore*parseFloat(tval)).toFixed(precision(parseFloat(tval)))
                } else {
                    d1.innerHTML = `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong>` + tname + '</strong>' + `<div style='color:red;'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +tval+'</div>'
                }
                
            } else {
                if (tval == 'none' ) {
                    noneCount++;
                }
                const o = stats[tname][tval];
                const { score } = o;
                totalScore += score;
               
                var p1 = ""
                var p2 = ""
               
                if (tiers[score.toString()]['name']=="Divine"){
                    p1 = "<strong><i>"
                    p2 = '</strong></i>'
                }
                var { color } = tiers[score.toString()]
                if ( specialAttrs.includes(tval) ) {
                    color = 'rgb(98, 63, 63)'
                }
                d1.innerHTML = '<strong>' + tname + '</strong>' + ' : ' + `<span style='color:${color}'>${p1}` +tval+`${p2}</span>`
            }
           
    
            wrap.appendChild(d1)
        }  
      
        unhide('tier-coloring')
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
  