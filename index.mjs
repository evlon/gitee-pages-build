
import GiteePage from "./giteePageBuild.mjs";
import gist from './giteeGistSync.mjs'

async function main() {
    let gitee = new GiteePage(process.env.GITEE_USERNAME,
        process.env.GITEE_PASSWORD,
        process.env.GITEE_REPO,
        process.env.GITEE_BRANCH,
        process.env.GITEE_DIRECTORY,
        process.env.GITEE_HTTPS);
    try {

        //sync from gitee gist
        gist.sync(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "./.cookie.json")

        await gitee.setCookieStoreFile(".cookie.json")

        //login gitee , when cookie is ok ,skip login api
        await gitee.login();

        //build page
        await gitee.pageBuild();

        //save cookie to gitee gist
        gist.save(process.env.GITEE_GIST_TOKEN, "./.cookie.json", process.env.GITEE_GIST_ID);

        console.log("build ok");
    }
    catch (e) {
        console.error(e);
    }


}

main();
