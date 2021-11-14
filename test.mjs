import pageBuild from './index.mjs'

pageBuild.pagebuild_with_obj_cookie();
 // or
pageBuild.pagebuild_with_file_cookie();

// gist.save(process.env.GITEE_GIST_TOKEN, "./.cookie.json", process.env.GITEE_GIST_ID);

// gist.sync(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "./.cookie.json")
