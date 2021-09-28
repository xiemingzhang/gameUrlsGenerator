#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const prodUrlRoot = "https://61cr.cn/ai/game/"

let AIGameUrlsData = {
	data: []
}
// let LiveGameUrlsData = {
// 	data: []
// }

let str = fs.readFileSync(process.argv[2]).toString().split("=")[1];
eval("var jsonObj=" + str)

let bundles = jsonObj.bundleVers
// let _excludeBundles = ["internal", 
//                     "main", 
//                     "resources", 
//                     "WH_frame", 
//                     "ScoreNum", 
//                     "StandPositionAdjustment", 
//                     "FBX",
//                     "Loading", 
//                     "TeachLayer", 
//                     "TrainLayer"
//                 ]
 
let AiGameKeys = []
let bundleVers = {}
// let LiveGameKeys = []
Object.keys(bundles).forEach((item)=>{
    if(item.startsWith("AiGame")){
        AiGameKeys.push(item)
    }
    // if(item.startsWith("LiveGame")){
    //     LiveGameKeys.push(item)
    // }
    if(item == "internal"
    || item == "WH_frame"
    || item == "resources"
    || item == "main"
    ){
        bundleVers[item] = bundles[item]
    }
})

AiGameKeys = AiGameKeys.sort((item1, item2)=>{
    return item1.split("_")[0].split("AiGame")[1] - item2.split("_")[0].split("AiGame")[1] 
})
// LiveGameKeys = LiveGameKeys.sort((item1, item2)=>{
//     return item1.split("_")[0].split("LiveGame")[1] - item2.split("_")[0].split("LiveGame")[1] 
// })

AiGameKeys.map((item) => {
    let _obj = {}
    _obj["step"] = item.split("_")[0].split("AiGame")[1]
    _obj["fragmentName"] = ""
    _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&aiGameName=" + item
    _obj["gameCount"] = 40
    _obj["gameDuration"] = 60
    AIGameUrlsData.data.push(_obj)
})

// LiveGameKeys.map((item) => {
//     let _obj = {}
//     _obj["step"] = item.split("_")[0].split("AiGame")[1]
//     _obj["fragmentName"] = ""
//     _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&liveGameName=" + item
//     _obj["gameCount"] = 40
//     _obj["gameDuration"] = 60
//     LiveGameUrlsData.data.push(_obj)
// })

console.log("settings.bundleVers")
console.log(`"bundleVers": {
    "internal": "${bundles["internal"]}",
    "WH_frame": "${bundles["WH_frame"]}",
    "main": "${bundles["main"]}"
}
`)

console.log("mainModify")
console.log(`
// if(!standBy){
    var gameName = aiGameName
    if(liveGameName){
      bundles.push("FBX")
      bundles.push("Loading")
      bundles.push("TeachLayer")
      bundles.push("TrainLayer")
      settings.bundleVers["FBX"] = "${bundles["FBX"]}"
      settings.bundleVers["Loading"] = "${bundles["Loading"]}"
      settings.bundleVers["TeachLayer"] = "${bundles["TeachLayer"]}"
      settings.bundleVers["TrainLayer"] = "${bundles["TrainLayer"]}"
      gameName = liveGameName
    }
    
    gameName && bundles.push(gameName)
    gameID && (settings.bundleVers[gameName] = gameID)
  // }else{
  //   bundles.push("StandPositionAdjustment")
  //   settings.bundleVers["StandPositionAdjustment"] = "${bundles["StandPositionAdjustment"]}"
  // }
  
  if (dev) {
    bundles.push("ScoreNum")
    bundles.push("AddScore")
    settings.bundleVers["ScoreNum"] = "${bundles["ScoreNum"]}"
    settings.bundleVers["AddScore"] = "${bundles["AddScore"]}"
  }
`)

console.log("AIGameUrlsData")
console.log(AIGameUrlsData)


