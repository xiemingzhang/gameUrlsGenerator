#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

const prodUrlRoot = "https://61cr.cn/ai/aiGame/"

let AIGameUrlsData = {
	data: []
}
let LiveGameUrlsData = {
	data: []
}
let CompetitionGameUrlsData = {
	data: []
}

let targetFile = process.argv[2]
let buildLocation = path.resolve(targetFile, "../../../")
let parentLocation = path.resolve(targetFile, "../../")
let gameLocation = path.resolve(parentLocation, "../aiGame")

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
let LiveGameKeys = []
let CompetitionGameKeys = []
let bundleVers = {}
Object.keys(bundles).forEach((item)=>{
    if(item.startsWith("AiGame")){
        AiGameKeys.push(item)
    }
    if(item.startsWith("LiveGame")){
        LiveGameKeys.push(item)
    }
    if(item.startsWith("CompetitionGame")){
        CompetitionGameKeys.push(item)
    }
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
LiveGameKeys = LiveGameKeys.sort((item1, item2)=>{
    return item1.split("_")[0].split("LiveGame")[1] - item2.split("_")[0].split("LiveGame")[1] 
})
CompetitionGameKeys = CompetitionGameKeys.sort((item1, item2)=>{
    return item1.split("_")[0].split("CompetitionGame")[1] - item2.split("_")[0].split("LiveGame")[1] 
})

function findNeedCopyFile() {
    let needFiles = []
    let files = fs.readdirSync(parentLocation)
    // console.log(files)
    files.forEach( item=>{
        let filepath1 = parentLocation + '/' + item
        let stat = fs.statSync(filepath1)
        if(stat.isFile()){
            // console.log(filepath1);
            if(item.startsWith("main.")
            || item.startsWith("settings.")
            || item.startsWith("style-mobile.")
            ){
                needFiles.push(item)
            }
        }
    } )
    // 因为要增量发布，所有这些要放到对应的game里，以防这些文件的md5值改变，如果公用则没有增量发布的则加载失败，所以放到对应的game里，只加载自己的这些文件就可以
    console.log("需要拷贝到对应game文件夹里的文件",needFiles)
    return needFiles
}

let needCopyFiles = findNeedCopyFile()

function copyNeedFiles(gameName){
    needCopyFiles.forEach(function(item){
        fs.copySync(parentLocation + "/" + item, buildLocation + `/aiGame/${gameName}/` + item)
    })
}

function createGameProj(gameName) {
    let itemLocation = path.resolve(gameLocation + "/" + gameName)
    let itemFile = path.resolve(itemLocation, "index.html")
    // console.log(itemFile)
    fs.mkdirSync(itemLocation)

    let _Str = IndexStr.replace(/\.\//g, '../')
    _Str = _Str.replace("XXXXXX", gameName)

    _Str = _Str.replace("internalID", bundles["internal"])
    _Str = _Str.replace("WH_frameID", bundles["WH_frame"])
    _Str = _Str.replace("resourcesID", bundles["resources"])
    _Str = _Str.replace("MAIN", "main")
    _Str = _Str.replace("mainID", bundles["main"])

    _Str = _Str.replace("ScoreNumID", bundles["ScoreNum"])
    _Str = _Str.replace("AddScoreID", bundles["AddScore"])

    // _Str = _Str.replace("OutWarningID", bundles["OutWarning"])
    _Str = _Str.replace("FBXID", bundles["FBX"])
    _Str = _Str.replace("LoadingID", bundles["Loading"])
    _Str = _Str.replace("TeachLayerID", bundles["TeachLayer"])
    _Str = _Str.replace("TrainLayerID", bundles["TrainLayer"])

    _Str = _Str.replace("CompetitionCommonID", bundles["CompetitionCommon"])

    _Str = _Str.replace("GAMEID", bundles[gameName])
    // _Str = _Str.replace("AiGame6_JumpID", bundles["AiGame6_Jump"])
    
    
    // 生成对应game的index.html
    fs.writeFileSync(itemFile, _Str)
    // 拷贝src文件夹到game文件夹里
    fs.copySync(parentLocation + "/src", buildLocation + "/aiGame/" + gameName + "/src")
    // 拷贝需要的文件到game文件夹里
    copyNeedFiles(gameName)
}

// 拷贝assets目录
fs.copySync(parentLocation + "/assets", buildLocation + "/assets", { overwrite: true })
// fs.copySync(parentLocation, buildLocation + "/game")

AiGameKeys.forEach((item) => {
    let _obj = {}
    _obj["id"] = item.split("_")[0].split("AiGame")[1]
    _obj["fragmentName"] = ""
    // _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&aiGameName=" + item
    _obj["gameUrl"] = prodUrlRoot + item
    // _obj["gameCount"] = 40
    // _obj["gameDuration"] = 60
    AIGameUrlsData.data.push(_obj)

    createGameProj(item)
})

LiveGameKeys.map((item) => {
    let _obj = {}
    _obj["id"] = item.split("_")[0].split("LiveGame")[1]
    _obj["fragmentName"] = ""
    // _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&liveGameName=" + item
    _obj["gameUrl"] = prodUrlRoot + item
    // _obj["gameCount"] = 40
    // _obj["gameDuration"] = 60
    LiveGameUrlsData.data.push(_obj)

    createGameProj(item)
})

CompetitionGameKeys.map((item) => {
    let _obj = {}
    _obj["id"] = item.split("_")[0].split("CompetitionGame")[1]
    _obj["fragmentName"] = ""
    // _obj["gameUrl"] = prodUrlRoot + "?gameID=" + bundles[item] + "&liveGameName=" + item
    _obj["gameUrl"] = prodUrlRoot + item
    // _obj["gameCount"] = 40
    // _obj["gameDuration"] = 60
    CompetitionGameUrlsData.data.push(_obj)

    createGameProj(item)
})

console.log("LiveGameUrlsData")
console.log(JSON.stringify(LiveGameUrlsData, null, 4))

console.log("CompetitionGameUrlsData")
console.log(JSON.stringify(CompetitionGameUrlsData, null, 4))

console.log("AIGameUrlsData")
console.log(JSON.stringify(AIGameUrlsData, null, 4))


// console.log("settings.bundleVers")
// if(bundles["resources"]){
//     console.log(`"bundleVers": {
//         "internal": "${bundles["internal"]}",
//         "WH_frame": "${bundles["WH_frame"]}",
//         "resources": "${bundles["resources"]}",
//         "main": "${bundles["main"]}"
//     }
//     `)
// }else{
//     console.log(`"bundleVers": {
//         "internal": "${bundles["internal"]}",
//         "WH_frame": "${bundles["WH_frame"]}",
//         "main": "${bundles["main"]}"
//     }
//     `) 
// }



