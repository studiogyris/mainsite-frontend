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

eval("async function main(){\n    const stats = await fetch('/drops/bura/statistics/index.json').then((res)=>{\n        return res.json()})\n\n    const allscores = await fetch('/drops/bura/statistics/allscores.json').then((res)=>{\n        return res.json()})\n\n    gid('input-buraid').addEventListener('input', onInputBuraID);\n    clicksen('fetch-btn',onClickFetch);\n   \n\n    const nonvis = [\n        'Strength',\n        'Intelligence',\n        'Wisdom',\n        'Dexterity',\n        'Resilience',\n        'Charisma',\n        'Height',\n        'Base rating'\n    ]\n\n    const tiers = {\n        '-1':{\n            'name':'none',\n            'color': 'white'\n        },\n        '0':{\n            'name':'Common',\n            'color': 'grey'\n        },\n        '2':{\n            'name':'Uncommon',\n            'color': 'rgb(94, 255, 30)'\n        },\n        '5':{\n            'name':'Rare',\n            'color': 'rgb(38, 81, 224)'\n        },\n        '10':{\n            'name':'Epic',\n            'color': 'rgb(179, 65, 207)'\n        },\n        '25':{\n            'name':'Legendary',\n            'color': 'rgb(226, 167, 41)'\n        },\n        '100':{\n            'name':'Divine',\n            'color': 'rgb(255, 255, 255)'\n        }\n    }\n\n    const bonuspoints = {\n        '5/12':15,\n        '12/12':25\n    }\n\n    const specialAttrs = ['Mahan Yura','The Old, the Gone, the Here and the Now','Chief Lap-Lap','Oo Na Gaiari','Moss','Akukani Bu-Raa-Nai']\n\n    function onInputBuraID(){\n        const inputE = gid(\"input-buraid\");\n        const v = inputE.value;\n        if (  v<0 || v===0 ){\n          inputE.value=\"\";\n        } else if ( v>2734){\n            inputE.value=2734;\n        }\n    }\n\n    function precision(a) {\n        if (!isFinite(a)) return 0;\n        var e = 1, p = 0;\n        while (Math.round(a * e) / e !== a) { e *= 10; p++; }\n        return p;\n      }\n\n    async function onClickFetch(){\n        \n        var totalScore = 10;\n        id = gid('input-buraid').value\n        if ( isNaN(id) || id=='' || id<0 || id===0 ){\n            return\n          } else if ( id>2734){\n              return\n            }\n       \n        editext('main-h',`Displaying attributes for Bura #${id}`)\n        gid('nonvis-attr-wrap').innerHTML=''\n        gid('vis-attr-wrap').innerHTML=''\n        const ans = await fetch('/drops/bura/metadata/'+id+'.json')\n        .then((res)=>{\n           return res.json()\n        })\n\n        gid('img-bura').src=`https://gyris-bura.b-cdn.net/${id}.jpg`\n        \n        const pp = creatE('div')\n        pp.innerHTML=\"<br>\"\n\n        gid('vis-attr-wrap').appendChild(pp)\n        var noneCount = 0;\n\n        const tn = creatE('div')\n        tn.innerHTML=`<strong style=\"font-size:120%\">Trait count: &nbsp<span id='trait-count'>?</span>/12</strong>&nbsp<span id=\"traitcount-bonus\"></span>`\n        gid('vis-attr-wrap').appendChild(tn)\n        gid('vis-attr-wrap').appendChild(creatE('br'))\n\n        for (attrObj of ans.attributes) {\n            const tname = attrObj.trait_type\n            var tval = attrObj.value\n            if (tval=='War Paint (Full skull)') {\n                tval = 'War Paint (Full Skull)'\n            }\n            \n            var isNonvis = false;\n            if (nonvis.includes(tname)) {\n                isNonvis = true;\n            }\n\n            const wrap = isNonvis ? gid('nonvis-attr-wrap') : gid('vis-attr-wrap')\n            const d1 = creatE('div')\n            \n\n            if (isNonvis) {\n                if (tname=='Resilience'){\n                    d1.innerHTML = `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong>` + tname + '</strong>' + `<div style='color:red;'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +tval+'</div><br>'\n                } else if (tname=='Base rating') {\n                   \n                    gid('trait-count').textContent=12-noneCount\n                    if ( noneCount == 0 ) {\n                        //12/12\n                        totalScore+=bonuspoints['12/12']\n                        gid('traitcount-bonus').textContent=`[+${bonuspoints['12/12']}]`\n                    } else if ( noneCount == 7 ){\n                        //5/12\n                        totalScore+=bonuspoints['5/12']\n                        gid('traitcount-bonus').textContent=`[+${bonuspoints['5/12']}]`\n                    }\n                    if (totalScore>100) {\n                        totalScore=100\n                    }\n                    const vs = (totalScore/20).toFixed(1)\n                    visrank = 1;\n                    for (scr of allscores['vis']) {\n                        if ((totalScore/20) < scr) {\n                            \n                            visrank++\n                        } else {\n                            break;\n                        }\n                    }\n\n                    gid('vis-score').textContent=`${vs}    ( #${visrank} )`\n\n                    nonvisrank = 1\n                    for (scr of allscores['nonvis']) {\n                        if ((tval) < scr) {\n                            nonvisrank++\n                        } else {\n                            break;\n                        }\n                    }\n\n                    combinedrank = 1\n                    for (scr of allscores['combined']) {\n                        if ((parseFloat(vs)+tval) < scr) {\n                            combinedrank++\n                        } else {\n                            break;\n                        }\n                    }\n\n                    gid('nonvis-score').textContent=`${tval.toFixed(1)}  ( #${nonvisrank} )`\n                    \n                    gid('combined-score').textContent=`${(parseFloat(vs)+tval).toFixed(1)}  ( #${combinedrank} )`\n                } else {\n                    d1.innerHTML = `&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<strong>` + tname + '</strong>' + `<div style='color:red;'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp` +tval+'</div>'\n                }\n                \n            } else {\n                if (tval == 'none' ) {\n                    noneCount++;\n                }\n                const o = stats[tname][tval];\n                const { score } = o;\n                totalScore += score;\n               \n                var p1 = \"\"\n                var p2 = \"\"\n               \n                if (tiers[score.toString()]['name']==\"Divine\"){\n                    p1 = \"<strong><i>\"\n                    p2 = '</strong></i>'\n                }\n                var { color } = tiers[score.toString()]\n                if ( specialAttrs.includes(tval) ) {\n                    color = 'rgb(98, 63, 63)'\n                }\n                d1.innerHTML = '<strong>' + tname + '</strong>' + ' : ' + `<span style='color:${color}'>${p1}` +tval+`${p2}</span>`\n            }\n           \n    \n            wrap.appendChild(d1)\n        }  \n      \n        unhide('tier-coloring')\n    }\n}main();\n\n\n////////////////////////////////////////////////////////////////////////\n// These functions below are purely convenience dom manipulation methods\n///////////////////////////////////////////////////////////////////////\nfunction enable(id){\n    gid(id).disabled='';\n  }\n  function disable(id){\n    gid(id).disabled='true';\n  }\n  function editext(id,text) {\n    gid(id).textContent=text;\n  }\n  function clog(a) {\n    console.log(a);\n  }\n  function creatE(a){\n    return document.createElement(a);\n  }\n  function hide(a){\n    gid(a).style.display=\"none\";\n  }\n  function unhide(a){\n    gid(a).style.display=\"\";\n  }\n  function insertAfter(referenceNode, newNode) {\n    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);\n  }\n  function gid(a){\n    return document.getElementById(a);\n  }\n  function clicksen(a,fn){\n    gid(a).addEventListener(\"click\",fn);\n  }\n  \n\n//# sourceURL=webpack://mainsite-frontend/./src/rarity.js?");

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