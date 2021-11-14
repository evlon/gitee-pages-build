
import GiteePage from './giteePageBuild.mjs'
import gist from './giteeGistSync.mjs'
import dotenv from 'dotenv'

export default async function main () {
  if (!process.env.GITEE_USERNAME) {
    dotenv.config()
  }

  console.log(process.env.GITEE_USERNAME,
    process.env.GITEE_PASSWORD,
    process.env.GITEE_REPO,
    process.env.GITEE_BRANCH,
    process.env.GITEE_DIRECTORY,
    process.env.GITEE_HTTPS)

  const gitee = new GiteePage(process.env.GITEE_USERNAME,
    process.env.GITEE_PASSWORD,
    process.env.GITEE_REPO,
    process.env.GITEE_BRANCH,
    process.env.GITEE_DIRECTORY,
    process.env.GITEE_HTTPS)
  try {
    // sync from gitee gist
    const syncResult = await gist.sync(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, './.cookie.json')
    console.log('sync cookie to local ' + syncResult)
    await gitee.setCookieStoreFile('.cookie.json')

    // login gitee , when cookie is ok ,skip login api
    const loginResult = await gitee.login()
    console.log('login ' + syncResult)
    // build page
    const buildResult = await gitee.pageBuild()
    console.log('pageBuild ' + buildResult)

    // save cookie to gitee gist
    const saveResult = await gist.save(process.env.GITEE_GIST_TOKEN, './.cookie.json', process.env.GITEE_GIST_ID)
    console.log('sync cookie to gitee gist  ' + saveResult)
    console.log('build ok')
    return true;
  } catch (e) {
    console.error(e)
    return false;
  }
};
