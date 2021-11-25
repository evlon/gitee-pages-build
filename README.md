# gitee-pages-build
自动登录Gitee并更新pages.
步骤如下：
1. 同步Cookie， 从Gitee Gist同步Cookie到本地
2. 如果Cookie有效，跳过登录，否则执行登录
3. 执行 page 更新。 （需要提前发布 pages )
4. 保存Cookie 到 gitee gist



设置环境变量
```
GITEE_USERNAME=evlon
GITEE_PASSWORD=your password
GITEE_REPO=
GITEE_BRANCH=main
GITEE_DIRECTORY=/
GITEE_HTTPS=1
GITEE_GIST_TOKEN=tokenstring
GITEE_GIST_ID=gist_id
CONFIG_DELAY_FETCH=2000
```


## 使用VERCEL部署，然后gitee hooks 回调，更新
[gitee-pages-build-by-vercel.git](https://github.com/evlon/gitee-pages-build-by-vercel.git)
