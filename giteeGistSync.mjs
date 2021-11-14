import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

async function sync (token, gistid, file) {
  const fileNmae = path.basename(file)
  const resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}?access_token=${token}`)

  if (resp.status === 200) {
    const jsonResult = await resp.json()
    const gistBlob = jsonResult.files[fileNmae]
    if (gistBlob) {
      const gitContent = gistBlob.content
      fs.writeFileSync(file, gitContent, { encoding: 'utf-8' })

      return true
    }
  }

  return false
}

async function save (token, file, gistid) {
  const fileNmae = path.basename(file)
  const fileContent = fs.readFileSync(file, { encoding: 'utf8' })
  const files = {}
  files[fileNmae] = { content: fileContent }
  const resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'

    },
    body: JSON.stringify({
      access_token: token,
      files: files,
      public: 'false'
    })
  })

  if (resp.status === 200) {
    return true
  } else {
    console.log(resp.status, await resp.text())
    return false
  }
}

async function sync_obj (token, gistid,gistfile, obj) {
 
  const resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}?access_token=${token}`)

  if (resp.status === 200) {
    const jsonResult = await resp.json()
    const gistBlob = jsonResult.files[gistfile]
    if (gistBlob) {
      const gitContent = gistBlob.content
      let gitJson = JSON.parse(gitContent);
      Object.assign(obj, gitJson);

      return true
    }
  }

  return false
}

async function save_obj (token, obj, gistid, gistfile) {
  
  const fileContent = JSON.stringify(obj);
  const files = {}
  files[gistfile] = { content: fileContent }
  const resp = await fetch(`https://gitee.com/api/v5/gists/${gistid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'

    },
    body: JSON.stringify({
      access_token: token,
      files: files,
      public: 'false'
    })
  })

  if (resp.status === 200) {
    return true
  } else {
    console.log(resp.status, await resp.text())
    return false
  }
}

export default {
  sync,
  save,
  sync_obj,
  save_obj
}
