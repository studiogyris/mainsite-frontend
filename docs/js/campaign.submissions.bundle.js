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

/***/ "./src/campaign.submissions.js":
/*!*************************************!*\
  !*** ./src/campaign.submissions.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ \"./src/config.js\");\n\n\n\n// ********[ Entry function ]*******\nasync function main(){\n  var subs;\n  var selectedCollection = 'bura'; \n  \n  \n  if (window.location.search!=''){\n    const query = window.location.search.split('=');\n    const collection = query[1].split('&')[0]\n    const id = query[2];\n    \n    hide('step1')\n    hide('step2')\n    hide('select-genus')\n    hide('fetch-controls');\n    gid('e1').innerHTML='';\n    gid('e2').innerHTML='';\n    gid('select-genus').value=collection;\n    selectedCollection=collection\n    editext('other-subs-collection-name',capitalize(collection))\n    onClickFetch(id);\n    \n    setPTitle(`Displaying submissions for ${selectedCollection} # ${id}`)\n  \n  } else {\n    getAllSubmissions(selectedCollection);\n    gid('select-genus').addEventListener('change',onCollectionSelected)\n    gid('fetch-btn').addEventListener('click',onClickFetch);\n    gid('input-id').addEventListener('input', onInputnftid);\n  }\n\n  if (window.screen.width<900) {\n    gid('text-backstory').style.width=window.screen.width*9/10+'px';\n  }\n  \n  \n  \n\n  clicksen('back-btn',onClickBack);\n  \n  \n  function onClickBack() {\n    window.location.href='..';\n  }\n\n  function onInputnftid(){\n    const inputE = gid(\"input-id\");\n    const v = inputE.value;\n    if (  v<0 || v===0 ){\n      inputE.value=\"\";\n    } \n  }\n\n\n  async function onCollectionSelected() {\n   \n    const selector = event.target;\n    const collection = selector.value;\n    hide('fetched-info')\n    selectedCollection = collection;\n    editext('other-subs-collection-name',capitalize(collection))\n    getAllSubmissions(collection);\n  }\n\n  async function getAllSubmissions(collection) {\n    \n    await fetch(_config_js__WEBPACK_IMPORTED_MODULE_0__.CFG.backendURL,{\n      method:'POST',\n      body: JSON.stringify({\n        getSubmissions: true,\n        collection\n      })\n    })\n    .then((res)=>{\n      return res.json();\n    }).then((res)=>{\n      \n      subs = res.details\n      fillOtherSubsTable()\n     }\n    )\n    \n  }\n\n  async function fillOtherSubsTable(){\n    const table = gid('subs-table');\n    table.children[0].replaceChildren(table.children[0].children[0]);\n\n    for (const sub of subs) {\n      \n      const tr = document.createElement('tr');\n\n\n      td = document.createElement('td');\n      td.innerHTML = `<a target=\"_blank\" href=\"https://gyris.io/rarity/${selectedCollection}?id=${sub['id'] }\"><span style='color: blue; font-size:120%'>${sub['id']}</span></a>`;sub['id'] \n      console.log(td.textContent)\n      tr.appendChild(td)\n\n      td = document.createElement('td');\n      td.textContent = sub['name'] ? removeTags(sub['name']) : '';\n      tr.appendChild(td)\n\n      var td = document.createElement('td');\n      td.innerHTML = sub['backstory'] ? removeTags(sub['backstory']) : '';\n      tr.appendChild(td)\n\n\n      table.children[0].appendChild(tr)\n      \n    }\n  }\n \n  var tagBody = '(?:[^\"\\'>]|\"[^\"]*\"|\\'[^\\']*\\')*';\n\nvar tagOrComment = new RegExp(\n    '<(?:'\n    // Comment body.\n    + '!--(?:(?:-*[^->])*--+|-?)'\n    // Special \"raw text\" elements whose content should be elided.\n    + '|script\\\\b' + tagBody + '>[\\\\s\\\\S]*?</script\\\\s*'\n    + '|style\\\\b' + tagBody + '>[\\\\s\\\\S]*?</style\\\\s*'\n    // Regular name\n    + '|/?[a-z]'\n    + tagBody\n    + ')>',\n    'gi');\nfunction removeTags(html) {\n  var oldHtml;\n  do {\n    oldHtml = html;\n    html = html.replace(tagOrComment, '');\n  } while (html !== oldHtml);\n  return html.replace(/</g, '&lt;');\n}\n\n  async function onClickFetch(buid){\n    if (!subs) {\n      await getAllSubmissions(selectedCollection);\n    }\n    \n    var nftid\n    if (typeof(buid)=='string') {\n      nftid = buid;\n    } else {\n      nftid = gid('input-id').value;\n    }\n    \n  \n\n    if (nftid == '' || isNaN(nftid) || parseInt(nftid)<0 ) {\n      displayErr('Please input correct ID');\n      return;\n    }\n\n    setPTitle(`<span style=\"color:red;font-size:110%;\">D</span>isplaying submissions for ${selectedCollection} # ${nftid}`)\n    \n    clearErr();\n    \n    \n    gid('twitter-wrap').innerHTML=`<a style=\"display:none;\" id=\"twitter-btn\" href=\"https://twitter.com/share?ref_src=twsrc%5Etfw\"\n        class=\"twitter-share-button\" data-size=\"large\"\n        data-text=\"Check out the name and backstory for this ${capitalize(selectedCollection)} \"\n        data-via=\"Gyris_official\" data-hashtags=\"LoreCampaignPart2\" data-lang=\"en\"\n        data-dnt=\"true\" data-show-count=\"true\" target=\"_blank\"\n        onclick=\"javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">Tweet</a>`\n\n\n    fetchSubmission(nftid);\n  }\n  \n  function findSubmissionByID(id){\n    \n    for (const sub of subs) {\n      if (sub['id']==parseInt(id)) {\n        return sub\n      }\n    }\n    return null;\n  }\n\n  function capitalize(word) {\n    const loweredCase = word.toLowerCase();\n    return word[0].toUpperCase() + loweredCase.slice(1);\n  }\n\n  function fetchSubmission(nftid) {\n    const data = findSubmissionByID(nftid);\n\n    if (!data){\n      hide('fetched-info')\n      return displayErr(`No submission found for ${capitalize(selectedCollection)} #${nftid}`);\n    }\n   \n\n    var script = document.createElement('script');\n    script.src = \"https://platform.twitter.com/widgets.js\";\n    script.async='true';\n    script.charset='utf-8';\n    script.id='twitter-script'\n    gid('twitter-wrap').appendChild(script);\n    \n    \n    \n\n    if (data.name==null) {\n      gid('input-name').value=\"The owner hasn't set a name\";\n    } else {\n      gid('input-name').value=data.name;\n    }\n\n    if (data.backstory==null) {\n      gid('text-backstory').value=\"The owner hasn't added a backstory yet\";\n    } else {\n      gid('text-backstory').value=data.backstory;\n    }\n\n    unhide('fetched-info')\n  }\n\n  // hides message box\n  function clearMsg(){\n    hide('display-msg-wrap');\n  }\n  // hides error message\n  function clearErr(){\n    hide('err-wrap');\n  }\n  \n  // displays a red error\n  function displayErr(msg) {\n    gid('err-msg').innerHTML=msg;\n    unhide('err-wrap');\n  }\n  // displays a green message\n  function displayMsg(msg) {\n    gid('display-msg').innerHTML=msg;\n    unhide('display-msg-wrap');\n  }\n \n\n  // sets process Title\n  function setPTitle(title) {\n    gid('main-h').innerHTML=title;\n\n  }\n};main()\n////////////////////////////////////////////////////////////////////////\n// These functions below are purely convenience dom manipulation methods\n///////////////////////////////////////////////////////////////////////\nfunction enable(id){\n  gid(id).disabled='';\n}\nfunction disable(id){\n  gid(id).disabled='true';\n}\nfunction editext(id,text) {\n  gid(id).textContent=text;\n}\nfunction clog(a) {\n  console.log(a);\n}\nfunction creatE(a){\n  return document.createElement(a);\n}\nfunction hide(a){\n  gid(a).style.display=\"none\";\n}\nfunction unhide(a){\n  gid(a).style.display=\"\";\n}\nfunction insertAfter(referenceNode, newNode) {\n  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);\n}\nfunction gid(a){\n  return document.getElementById(a);\n}\nfunction clicksen(a,fn){\n  gid(a).addEventListener(\"click\",fn);\n}\n\n//# sourceURL=webpack://mainsite-frontend/./src/campaign.submissions.js?");

/***/ }),

/***/ "./src/config.js":
/*!***********************!*\
  !*** ./src/config.js ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

eval("const CFG = {\n  rpcUrl: 'https://green-ancient-energy.solana-mainnet.quiknode.pro/787de86af48ab90143f19e444ae1481b1e380de8/',\n  CMID: '8ny7jWGara64yKGRr2NYa6oCCmfUQPBRTtP3N3bx1Yst',\n  devnet: true,\n  maxPerTx: 100,\n  marketplaceName: 'Magic Eden',\n  marketplaceCollection: 'https://magiceden.io/marketplace/gyris_genesys',\n  fromWLtoPublic: 2 * 60 * 60 * 1000,\n  backendURL: 'https://on4gbht69b.execute-api.eu-central-1.amazonaws.com/dev/'\n  \n}\nexports.CFG = CFG;\n\n\n//# sourceURL=webpack://mainsite-frontend/./src/config.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/campaign.submissions.js");
/******/ 	
/******/ })()
;