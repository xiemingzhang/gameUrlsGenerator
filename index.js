#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

const prodUrlRoot = "https://61cr.cn/ai/game/"

let AIGameUrlsData = {
	data: []
}
// let LiveGameUrlsData = {
// 	data: []
// }

let targetFile = process.argv[2]
let parentLocation = path.resolve(targetFile, "../../")
let gameLocation = path.resolve(parentLocation, "./game")

let indexFile = path.resolve(parentLocation, "./index.html")
if(fs.existsSync(gameLocation)){
    fs.emptyDirSync(gameLocation)
}else{
    fs.mkdirSync(gameLocation)
}

// console.log(targetFile)
// console.log(parentLocation)
// console.log(gameLocation)
// console.log(indexFile)

let IndexStr = fs.readFileSync(indexFile).toString()
// console.log(IndexStr)
// return

let str = fs.readFileSync(targetFile).toString().split("=")[1];
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

AiGameKeys.forEach((item) => {
    let _obj = {}
    _obj["step"] = item.split("_")[0].split("AiGame")[1]
    _obj["fragmentName"] = ""
    // _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&aiGameName=" + item
    _obj["gameUrl"] = prodUrlRoot + item
    _obj["gameCount"] = 40
    _obj["gameDuration"] = 60
    AIGameUrlsData.data.push(_obj)

    let itemLocation = path.resolve(gameLocation + "/" + item)
    let itemFile = path.resolve(itemLocation, "index.html")
    // console.log(itemFile)
    fs.mkdirSync(itemLocation)

    let _Str = IndexStr.replace(/\.\//g, '../')
    _Str = _Str.replace("XXXXXX", item)

    _Str = _Str.replace("FBXID", bundles["FBX"])
    _Str = _Str.replace("loadingID", bundles["loading"])
    _Str = _Str.replace("TeachLayerID", bundles["TeachLayer"])
    _Str = _Str.replace("TrainLayerID", bundles["TrainLayer"])
    _Str = _Str.replace("ScoreNumID", bundles["ScoreNum"])
    _Str = _Str.replace("AddScoreID", bundles["AddScore"])
    _Str = _Str.replace("GAMEID", bundles[item])
    
    fs.writeFileSync(itemFile, _Str)
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

console.log("AIGameUrlsData")
console.log(AIGameUrlsData)


