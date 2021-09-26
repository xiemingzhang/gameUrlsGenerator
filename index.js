#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const prodUrlRoot = "https://61cr.cn/ai/game/"

let gameUrlsData = {
	data: []
}

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
 
let keys = Object.keys(bundles).filter((item)=>{
    if(item.startsWith("AiGame")){
        return item
    }
})
keys = keys.sort((item1, item2)=>{
    return item1.split("_")[0].split("AiGame")[1] - item2.split("_")[0].split("AiGame")[1] 
})

keys.map((item) => {
    let _obj = {}
    _obj["step"] = item.split("_")[0].split("AiGame")[1]
    _obj["fragmentName"] = ""
    _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&aiGameName=" + item
    _obj["gameCount"] = 40
    _obj["gameDuration"] = 60
    gameUrlsData.data.push(_obj)
})

console.log(gameUrlsData)

