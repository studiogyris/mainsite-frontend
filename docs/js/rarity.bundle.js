/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/rarity.js":
/*!***********************!*\
  !*** ./src/rarity.js ***!
  \***********************/
/***/ (() => {

eval("async function main(){\n    const pathn = window.location.pathname;\n    var stats,allscores,nonvis,collectionName,subclassLimits;\n\n    var isMobile = screen.width < 521 ? true : false;\n\n   \n    if (pathn.includes('bura')) {\n        collectionName = 'bura';\n\n        if (isMobile) {\n            gid('item-img').src= `https://gyris-${collectionName}-350x350.b-cdn.net/123.jpg`\n        } else {\n            gid('item-img').src= `https://gyris-${collectionName}-800x800.b-cdn.net/123.jpg`\n        }\n    \n\n        stats = await fetch('/drops/bura/statistics/index.json').then((res)=>{\n            return res.json()})\n    \n        allscores = await fetch('/drops/bura/statistics/allscores.json').then((res)=>{\n            return res.json()})\n\n        subclassLimits = await fetch('/drops/bura/additional/subclasslimits.json').then((res)=>{\n            return res.json()})\n\n        nonvis = [\n            'Strength',\n            'Intelligence',\n            'Wisdom',\n            'Dexterity',\n            'Resilience',\n            'Charisma',\n            'Height',\n            'Base rating'\n        ]\n\n    } else if (pathn.includes('ogg')) {\n        collectionName = 'ogg';\n\n        stats = await fetch('/drops/ogg/statistics/index.json').then((res)=>{\n            return res.json()})\n    \n        allscores = await fetch('/drops/ogg/statistics/allscores.json').then((res)=>{\n            return res.json()})\n\n        subclassLimits = await fetch('/drops/ogg/additional/subclasslimits.json').then((res)=>{\n            return res.json()})\n\n        nonvis = [\n            'Strength',\n            'Agility',\n            'Endurance',\n            'Synergy',\n            'Resilience',\n            'Base rating'\n        ]\n    } \n    \n   \n\n    gid('input-itemid').addEventListener('input', onInputItemID);\n    clicksen('fetch-btn',onClickFetch);\n   \n\n    \n\n    const tiers = {\n        '-1':{\n            'name':'none',\n            'color': 'white'\n        },\n        '0':{\n            'name':'Common',\n            'color': 'grey'\n        },\n        '2':{\n            'name':'Uncommon',\n            'color': 'rgb(94, 255, 30)'\n        },\n        '5':{\n            'name':'Rare',\n            'color': 'rgb(38, 81, 224)'\n        },\n        '10':{\n            'name':'Epic',\n            'color': 'rgb(179, 65, 207)'\n        },\n        '25':{\n            'name':'Legendary',\n            'color': 'rgb(226, 167, 41)'\n        },\n        '100':{\n            'name':'Divine',\n            'color': 'rgb(255, 255, 255)'\n        }\n    }\n\n    const bonuspoints = {\n        '5/12':15,\n        '12/12':25\n    }\n\n    const specialAttrs = ['Mahan Yura','The Old, the Gone, the Here and the Now','Chief Lap-Lap','Oo Na Gaiari','Moss','Akukani Bu-Raa-Nai']\n\n    function onInputItemID(){\n        const inputE = gid(\"input-itemid\");\n        const v = inputE.value;\n        if (  v<0 || v===0 ){\n          inputE.value=\"\";\n        } else if ( v>2734){\n            inputE.value=2734;\n        }\n    }\n\n    function precision(a) {\n        if (!isFinite(a)) return 0;\n        var e = 1, p = 0;\n        while (Math.round(a * e) / e !== a) { e *= 10; p++; }\n        return p;\n      }\n      function capitalize(str) {\n        return str.charAt(0).toUpperCase() + str.slice(1);\n      }\n\n    async function onClickFetch(){\n        \n        var totalScore = 10;\n        id = gid('input-itemid').value\n        if ( isNaN(id) || id=='' || id<0 || id===0 ){\n            return\n          } else if ( id>2734){\n              return\n            }\n        unhide('extended')\n        gid('title').textContent=capitalize(collectionName)+' #';\n        hide('memorandum');\n        unhide('nothing')\n        gid('item-img').src='/img/giphy.gif';\n\n        const ans = await fetch('/drops/'+collectionName + '/metadata/'+id+'.json')\n        .then((res)=>{\n           return res.json()\n        })\n        var r1 = false;\n        while (r1==false) {\n            try {\n                if (isMobile) {\n                \n                    gid('item-img').src=`https://gyris-${collectionName}-350x350.b-cdn.net/${id}.jpg`\n                } else {\n                    gid('item-img').src=`https://gyris-${collectionName}-800x800.b-cdn.net/${id}.jpg`\n                }\n                await new Promise(r => setTimeout(r, 50));     \n                r1 = true;\n            } catch (err) {\n                await new Promise(r => setTimeout(r, 50));  \n            }\n            \n        }\n      \n        \n\n\n        gid('view-original').href=`https://gyris-${collectionName}.b-cdn.net/${id}.jpg`\n        \n        \n\n        gid('title-itemid').innerHTML=id;\n\n        var noneCount = 0;\n\n\n        for (attrObj of ans.attributes) {\n            const tname = attrObj.trait_type\n            if ( tname == \"ID\" ) continue;\n\n           \n\n            var tval = attrObj.value\n            if (tval=='War Paint (Full skull)') {\n                tval = 'War Paint (Full Skull)'\n            }\n\n            if (tname == \"Memorandi I\" ) {\n                editext('memorandum-text',tval);\n                hide('nothing');\n                unhide('memorandum')\n                continue;\n            }\n            \n            var isNonvis = false;\n            if (nonvis.includes(tname)) {\n                isNonvis = true;\n            }\n\n            if (isNonvis) {\n                 if (tname=='Base rating') {\n                   \n                    if (collectionName=='bura') {\n                        if ( noneCount == 0 ) {\n                            //12/12\n                            totalScore+=bonuspoints['12/12']\n                            //gid('traitcount-bonus').textContent=`[+${bonuspoints['12/12']}]`\n                        } else if ( noneCount == 7 ){\n                            //5/12\n                            totalScore+=bonuspoints['5/12']\n                            //gid('traitcount-bonus').textContent=`[+${bonuspoints['5/12']}]`\n                        }\n                    }\n\n\n                    if (totalScore>100) {\n                        totalScore=100\n                    }\n                    const vs = (totalScore/20).toFixed(1)\n                    visrank = 1;\n                    var samescoreAmountVis=0;\n\n                    for (scr of allscores['vis']) {\n                        if ((totalScore/20) < scr) {\n                            \n                            visrank++\n                        } else if ( parseFloat((totalScore/20).toFixed(2))==scr ) {\n                            samescoreAmountVis++;\n                        } else {\n                            break;\n                        }\n                    }\n            \n                    gid('vis-score').textContent=`${vs}/5`\n\n                    var visBetterThan = 2735 - visrank - samescoreAmountVis;\n                    var visMarginLeft  = visBetterThan / (2735/315)\n                    var visWidth = samescoreAmountVis / (2735/315)\n                    if ( visWidth < 7 ) visWidth = 7;\n                    if (visMarginLeft > 307) visMarginLeft = 307;\n                    gid('vis-bar').style['margin-left']= visMarginLeft +'px' \n                    gid('vis-bar').style.width= (visWidth ).toFixed(0) + 'px'\n                    \n                    gid(\"vis-better\").textContent= (( (2735 - visrank - samescoreAmountVis + 1 ) / 2735 ) * 100).toFixed(1);\n                    gid(\"vis-same\").textContent= (( samescoreAmountVis / 2735 ) * 100).toFixed(1);\n                    gid(\"vis-worse\").textContent= (( (visrank - 1 ) / 2735 ) * 100).toFixed(1);\n                   \n                    var samescoreAmountNonvis = 0;\n\n                    nonvisrank = 1\n                    for (scr of allscores['nonvis']) {\n                        if ((tval) < scr) {\n                            nonvisrank++\n                        } else if ( tval==scr ) {\n                            samescoreAmountNonvis++;\n                        } else {\n                            break;\n                        }\n                    }\n                    var samescoreAmountComb = 0;\n                    combinedrank = 1\n                    for (scr of allscores['combined']) {\n                        if ((parseFloat(vs)+tval) < scr) {\n                            combinedrank++\n                        } else if ( (parseFloat(vs)+tval)==scr ) {\n                            samescoreAmountComb++;\n                        } else {\n                            break;\n                        }\n                    }\n\n                    gid('nonvis-score').textContent=`${tval.toFixed(1)}/5`\n\n                    var nonvisBetterThan = 2735 - nonvisrank - samescoreAmountNonvis;\n                    var nonvisMarginLeft  = nonvisBetterThan / (2735/315)\n                    var nonvisWidth = samescoreAmountNonvis / (2735/315)\n                    if ( nonvisWidth < 7 ) nonvisWidth = 7;\n                    if (visMarginLeft > 307) visMarginLeft = 307;\n                    gid('nonvis-bar').style['margin-left']= nonvisMarginLeft +'px';\n                   \n                    gid('nonvis-bar').style.width= (nonvisWidth ).toFixed(0) + 'px';\n                    gid(\"nonvis-better\").textContent= (( (2735 - nonvisrank - samescoreAmountNonvis + 1 ) / 2735 ) * 100).toFixed(1);\n                    gid(\"nonvis-same\").textContent= (( samescoreAmountNonvis / 2735 ) * 100).toFixed(1);\n                    gid(\"nonvis-worse\").textContent= (( (nonvisrank - 1 ) / 2735 ) * 100).toFixed(1);\n                 \n                } else {\n                    gid('attr-val-'+tname).textContent=tval;\n                    if (tname!='Height') {\n                        const greenbar = gid('barwrap-'+tname.toLowerCase()).children[0];\n                        const min = greenbar.style['margin-left'];\n                        const minn = parseInt(min.split('p')[0])\n                        greenbar.style.width = (tval * 2.4 - minn ).toFixed(0) + 'px';\n                    }\n                    \n                }\n                \n            } else {\n                if (tval == 'none' ) {\n                    noneCount++;\n                }\n                const idp2 = tname.replace(/\\s+/g, '-').toLowerCase();\n                \n                if (collectionName=='bura') {\n                    if (tname=='Class') {\n                        const className = tval.split(' ')[0];\n                        const isYaru = tval.split(' ')[1] ? true : false;\n                        gid('classname').textContent = subclassLimits.dictionary[subclassLimits.mapping[className]];\n                        gid('isyaru').textContent = isYaru ? 'Yaru (Apprentice)' : 'Carved weapon'\n                        const scl = subclassLimits.values[ (subclassLimits.mapping[className]).toFixed(0) ];\n\n                        for (attrName in scl) {\n                            \n                            const greenbar = gid('barwrap-'+attrName.toLowerCase()).children[0]\n                            const redbar = gid('barwrap-'+attrName.toLowerCase()).children[1]\n                            const { max } = scl[attrName];\n                            const { min } = scl[attrName];\n                            greenbar.style['margin-left']=(min * 2.4).toFixed(0) + 'px';\n                            redbar.style['margin-left']=(min* 2.40).toFixed(0) + 'px';\n                            redbar.style.width=(max * 2.4 - min * 2.4).toFixed(0) + 'px';\n                        }\n\n                    }\n                } else if (collectionName=='ogg') {\n                    if (tname==\"Type\") {\n                        const className = tval;\n                        \n                        gid('classname').textContent = className\n                        gid('isyaru').textContent = subclassLimits.dictionary[subclassLimits.mapping[className]];\n                        const scl = subclassLimits.values[ (subclassLimits.mapping[className]).toFixed(0) ];\n                        \n\n                        for (attrName in scl) {\n                            \n                            const greenbar = gid('barwrap-'+attrName.toLowerCase()).children[0]\n                            const redbar = gid('barwrap-'+attrName.toLowerCase()).children[1]\n                            const { max } = scl[attrName];\n                            const { min } = scl[attrName];\n                            greenbar.style['margin-left']=(min * 2.4).toFixed(0) + 'px';\n                            redbar.style['margin-left']=(min* 2.40).toFixed(0) + 'px';\n                            redbar.style.width=(max * 2.4 - min * 2.4).toFixed(0) + 'px';\n                        }\n\n                    }\n                }\n                \n\n                const o = stats[tname][tval];\n                const { score } = o;\n                totalScore += score;\n               \n               \n                if (tiers[score.toString()]['name']==\"Divine\"){\n                   gid('visa-'+idp2).innerHTML=`<strong><i>${tval}</i></strong>`;\n                } else {\n                   gid('visa-'+idp2).textContent=tval;\n                }\n                var { color } = tiers[score.toString()]\n                if ( specialAttrs.includes(tval) ) {\n                    color = 'rgb(98, 63, 63)'\n                }\n                gid('visa-'+idp2).style.color=color;   \n            }\n        }  \n    }\n}main();\n\n\n////////////////////////////////////////////////////////////////////////\n// These functions below are purely convenience dom manipulation methods\n///////////////////////////////////////////////////////////////////////\nfunction enable(id){\n    gid(id).disabled='';\n  }\n  function disable(id){\n    gid(id).disabled='true';\n  }\n  function editext(id,text) {\n    gid(id).textContent=text;\n  }\n  function clog(a) {\n    console.log(a);\n  }\n  function creatE(a){\n    return document.createElement(a);\n  }\n  function hide(a){\n    gid(a).style.display=\"none\";\n  }\n  function unhide(a){\n    gid(a).style.display=\"\";\n  }\n  function insertAfter(referenceNode, newNode) {\n    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);\n  }\n  function gid(a){\n    return document.getElementById(a);\n  }\n  function clicksen(a,fn){\n    gid(a).addEventListener(\"click\",fn);\n  }\n  \n\n//# sourceURL=webpack://mainsite-frontend/./src/rarity.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/rarity.js"]();
/******/ 	
/******/ })()
;