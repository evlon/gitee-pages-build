import gist from './giteeGistSync.mjs'

gist.save(process.env.GITEE_GIST_TOKEN, "./.cookie.json", process.env.GITEE_GIST_ID);

gist.sync(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "./.cookie.json")