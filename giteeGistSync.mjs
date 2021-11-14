import fs from 'fs';
import path from 'path'
import fetch from 'node-fetch'


async function sync(token, gistid, file){
    let fileNmae = path.basename(file);
    let resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}?access_token=${token}`);

    if(resp.status == 200){
        let jsonResult = await resp.json();
        let gistBlob = jsonResult.files[fileNmae];
        if(gistBlob){
            let gitContent = gistBlob.content;
            fs.writeFileSync(file, gitContent,{encoding:'utf-8'});

            return true;
        }       
    }

    return false;

}

async function save(token, file,gistid){

    let fileNmae = path.basename(file);
    let fileContent = fs.readFileSync(file,{encoding:'utf8'});
    let files = {};
    files[fileNmae] = {"content":fileContent};
    let resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}`,{
        method:"PATCH",
        headers:{
            "Content-Type": "application/json;charset=UTF-8",
            
        },
        body: JSON.stringify({
            "access_token":token,
            "files":files,
            "public":"false"
        })
    });

    if(resp.status == 200){
       return true;
    }
    else{

        console.log(resp.status, await resp.text());
        return false;
    }

}

export default {
    sync,
    save
}