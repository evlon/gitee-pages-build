import pageBuild from './index.mjs'

async function main_by_obj(){
    await pageBuild.gitee_login_with_obj_cookie();

    await pageBuild.pagebuild_with_obj_cookie();
}


main_by_obj()


 

// gist.save(process.env.GITEE_GIST_TOKEN, "./.cookie.json", process.env.GITEE_GIST_ID);

// gist.sync(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "./.cookie.json")
