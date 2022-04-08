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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ \"./src/config.js\");\n\n\n\n// ********[ Entry function ]*******\nasync function main(){\n  const mapping = await fetch('/campaign/mapping.json').then((res)=>{\n    return res.json()})\n  if (window.location.search!=''){\n    const buraidtoshow = window.location.search.split('=')[1];\n    hide('fetch-controls');\n    onClickFetch(buraidtoshow);\n    setPTitle('Displaying submissions for Bura #'+buraidtoshow)\n    hide('id-sign')\n  } else {\n    \n\n    gid('fetch-btn').addEventListener('click',onClickFetch);\n    gid('input-buraid').addEventListener('input', onInputBuraID);\n  }\n\n  if (window.screen.width<900) {\n      \n    gid('text-backstory').style.width=window.screen.width*9/10+'px';\n  }\n  \n  \n\n  clicksen('back-btn',onClickBack);\n  \n  \n  function onClickBack() {\n    window.location.href='..';\n  }\n\n  function onInputBuraID(){\n    const inputE = gid(\"input-buraid\");\n    const v = inputE.value;\n    if (  v<0 || v===0 ){\n      inputE.value=\"\";\n    } else if ( v>2734){\n        inputE.value=2734;\n    }\n  }\n\n  async function onClickFetch(buid){\n    \n    var buraID\n    if (typeof(buid)=='string') {\n      buraID = buid;\n    } else {\n      buraID = gid('input-buraid').value;\n    }\n    \n\n    if (buraID == '' || isNaN(buraID) || parseInt(buraID)<0 || parseInt(buraID)>2734 ) {\n      displayErr('Please input correct BuraID');\n      return;\n    }\n\n    if (!mapping[buraID]) {\n      displayErr(\"This Bura hasn't been minted yet\");\n      return;\n    }\n    clearErr();\n    \n    const url = _config_js__WEBPACK_IMPORTED_MODULE_0__.CFG.backendURL +'/campaign/submissions?buraid='+buraID;\n\n    gid('twitter-wrap').innerHTML=`<a style=\"display:none;\" id=\"twitter-btn\" href=\"https://twitter.com/share?ref_src=twsrc%5Etfw\"\n        class=\"twitter-share-button\" data-size=\"large\"\n        data-text=\"Check out the name and backstory for this Bura: https://gyris.io/campaign/submissions?buraid=${buraID}.\\nYou can view others' submissions here: \"\n        data-via=\"Gyris_official\" data-hashtags=\"nameandbackstorycampaign\" data-lang=\"en\"\n        data-dnt=\"true\" data-show-count=\"true\" target=\"_blank\"\n        onclick=\"javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');return false;\">Tweet</a>`\n\n\n    gid('fetch-btn').value='Waiting...'\n    fetch(url)\n    .then((res)=>{\n      return res.json();\n    })\n    .then((res)=>{\n      console.log(res);\n      \n      gid('fetch-btn').value='Fetch';\n      \n      if (res.code<0){\n        displayErr(res.message)\n      } else {\n        unhide('fetched-info')\n        displayFetchedData(res.data);\n      }\n    })\n    \n  }\n  \n  function displayFetchedData(data) {\n\n    var script = document.createElement('script');\n    script.src = \"https://platform.twitter.com/widgets.js\";\n    script.async='true';\n    script.charset='utf-8';\n    script.id='twitter-script'\n    gid('twitter-wrap').appendChild(script);\n    \n    if (data.reroll==false) {\n      editext('reroll-bool','NO');\n      gid('reroll-bool').style.color='yellow'\n    } else {\n      editext('reroll-bool','YES');\n      gid('reroll-bool').style.color='lightgreen'\n    }\n\n    if (data.name==null) {\n      gid('input-name').value=\"The owner hasn't set a name\";\n    } else {\n      gid('input-name').value=data.name;\n    }\n\n    if (data.backstory==null) {\n      gid('text-backstory').value=\"The owner hasn't added a backstory yet\";\n    } else {\n      gid('text-backstory').value=data.backstory;\n    }\n  }\n\n  // hides message box\n  function clearMsg(){\n    hide('display-msg-wrap');\n  }\n  // hides error message\n  function clearErr(){\n    hide('err-wrap');\n  }\n  \n  // displays a red error\n  function displayErr(msg) {\n    gid('err-msg').innerHTML=msg;\n    unhide('err-wrap');\n  }\n  // displays a green message\n  function displayMsg(msg) {\n    gid('display-msg').innerHTML=msg;\n    unhide('display-msg-wrap');\n  }\n \n\n  // sets process Title\n  function setPTitle(title) {\n    gid('main-h').innerHTML=title;\n\n  }\n};main()\n////////////////////////////////////////////////////////////////////////\n// These functions below are purely convenience dom manipulation methods\n///////////////////////////////////////////////////////////////////////\nfunction enable(id){\n  gid(id).disabled='';\n}\nfunction disable(id){\n  gid(id).disabled='true';\n}\nfunction editext(id,text) {\n  gid(id).textContent=text;\n}\nfunction clog(a) {\n  console.log(a);\n}\nfunction creatE(a){\n  return document.createElement(a);\n}\nfunction hide(a){\n  gid(a).style.display=\"none\";\n}\nfunction unhide(a){\n  gid(a).style.display=\"\";\n}\nfunction insertAfter(referenceNode, newNode) {\n  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);\n}\nfunction gid(a){\n  return document.getElementById(a);\n}\nfunction clicksen(a,fn){\n  gid(a).addEventListener(\"click\",fn);\n}\n\n\n//# sourceURL=webpack://mainsite-frontend/./src/campaign.submissions.js?");

/***/ }),

/***/ "./src/config.js":
/*!***********************!*\
  !*** ./src/config.js ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

eval("const CFG = {\n  //rpcUrl: 'https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899',\n  rpcUrl: 'https://ssc-dao.genesysgo.net/',\n  CMID: 'BHihZmx5nPWcwY9gMJz4ZdCeJeCJo9vnyzUWgh331hN1',\n  devnet: false,\n  maxPerTx: 15,\n  marketplaceName: 'Magic Eden',\n  marketplaceCollection: 'https://magiceden.io/marketplace/gyris',\n  fromWLtoPublic: 2 * 60 * 60 * 1000,\n  backendURL: 'https://api.gyris.io'\n  \n}\nexports.CFG = CFG;\n\n\n//# sourceURL=webpack://mainsite-frontend/./src/config.js?");

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