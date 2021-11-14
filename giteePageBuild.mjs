import nodefetch from 'node-fetch'
import nodefetchWrap from 'fetch-cookie/node-fetch.js' // use this to get cookie when redirct occus.
import cookiefetch from 'fetch-cookie'
import NodeRsa from 'node-rsa'
import * as cheerio from 'cheerio'
import URLSearchParams from 'url-search-params'
import { CookieJar } from 'tough-cookie'
import cookieFileStoreLib from 'tough-cookie-file-store/lib/cookie-file-store.js'
import sleep from 'sleep-anywhere'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIrn+WB2Yi4ABAL5Tq6E09tumY
qVTFdpU01kCDUmClczJOCGZriLNMrshmN9NJxazpqizPthwS1OIK3HwRLEP9D3GL
7gCnvN6lpIpoVwppWd65f/rK2ewv6dstN0fCmtVj4WsLUchWlgNuVTfWljiBK/Dc
YkfslRZzCq5Fl3ooowIDAQAB
-----END PUBLIC KEY-----`

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36'

const GITEE_DOMAIN = 'https://gitee.com'

let fetch = cookiefetch(nodefetchWrap(nodefetch))
class GiteePage {
  constructor (username, password,
    repo, branch = 'master',
    directory = '', https = 'true') {
    this.username = username
    this.password = password
    this.repo = repo
    this.branch = branch
    this.directory = directory
    this.https = https
  }

  async setCookieStoreFile (jsonFilePath) {
    const cookieJar = new CookieJar(new cookieFileStoreLib.FileCookieStore(jsonFilePath))

    fetch = cookiefetch(nodefetchWrap(nodefetch), cookieJar)
  }

  async login () {
    const giteeDomain = GiteePage.giteeDomain || GITEE_DOMAIN
    const login_index_url = `${giteeDomain}/login`
    const check_login_url = `${giteeDomain}/check_user_login`
    let form_data = { user_login: this.username }

    const index_headers = {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      Host: 'gitee.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT
    }

    let resp = await fetch(login_index_url, {
      headers: index_headers
      // agent: new HttpProxyAgent("http://localhost:8888") ,
    })

    if (resp.url != login_index_url) {
      // 跳转到主页，说明已经登录好了
      return true
    }

    let respText = await resp.text()

    const csrf_token = this.get_csrf_token(respText)

    const headers = {
      Referer: login_index_url,
      'Content-Type': 'application/json; charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrf_token,
      'User-Agent': USER_AGENT
    }

    await sleep(GiteePage.delayFetch || 2000)
    resp = await fetch(check_login_url, {
      method: 'POST',
      // agent: new HttpProxyAgent("http://localhost:8888") ,
      headers: headers,
      data: form_data
    })

    const data = `${csrf_token}$gitee$${this.password}`

    const clientKey = new NodeRsa(PUBLIC_KEY)
    clientKey.setOptions({ encryptionScheme: 'pkcs1' })

    const encrypt_data = clientKey.encrypt(data, 'base64')

    form_data = {
      encrypt_key: 'password',
      utf8: '✓',
      authenticity_token: csrf_token,
      redirect_to_url: '',
      'user[login]': this.username,
      'encrypt_data[user[password]]': encrypt_data,
      'user[remember_me]': 1
    }

    await sleep(GiteePage.delayFetch || 5000)
    resp = await fetch(login_index_url, {
      method: 'POST',
      // agent: new HttpProxyAgent("http://localhost:8888") ,
      headers: index_headers,
      body: new URLSearchParams(form_data).toString()
    })

    respText = await resp.text()

    if (resp.url != login_index_url) {
      // redirect to / when ok.
      return true
    }

    if (respText.indexOf('"message": "帐号或者密码错误"') != -1 ||
            respText.indexOf('"message": "Invalid email or password."') != -1 ||
            respText.indexOf('"message": "not_found_in_database"') != -1 ||
            respText.indexOf('"message": "not_found_and_show_captcha"') != -1) {
      throw 'Wrong username or password, login failed.'
    }

    if (respText.indexOf('"message": "captcha_expired"') != -1) {
      throw 'Need captcha validation, please visit  https://gitee.com/login,  login to validate your account.'
    }

    if (respText.indexOf('"message": "phone_captcha_fail"') != -1 ||
            respText.indexOf('当前帐号存在异常登录行为，为确认你的有效身份') != -1 ||
            respText.indexOf('一条包含验证码的信息已发送至你的') != -1) {
      throw 'Need phone captcha validation, please follow  gitee wechat subscription  and bind your account.'
    }

    if (!(respText.indexOf('个人主页') != -1 ||
            respText.indexOf('我的工作台') != -1 ||
            respText.indexOf('我的工作臺') != -1)) {
      throw `Unknown error occurred in login method, resp: ${respText}`
    }

    return false
  }

  async pageBuild () {
    const giteeDomain = GiteePage.giteeDomain || GITEE_DOMAIN
    const pages_url = `${giteeDomain}/${this.username}/${this.repo}/pages`
    const rebuild_url = `${pages_url}/rebuild`

    let resp = await fetch(pages_url)
    let respText = await resp.text()
    const csrf_token = this.get_csrf_token(respText)

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: pages_url,
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrf_token,
      'User-Agent': USER_AGENT
    }
    const form_data = {
      branch: this.branch,
      build_directory: this.directory,
      force_https: this.https
    }

    resp = await fetch(rebuild_url, {
      method: 'POST',
      headers: headers,
      timeout: GiteePage.timeout || 5000,
      body: new URLSearchParams(form_data).toString()
    })

    if (resp.status != 200) {
      throw `Rebuild page error, status code: ${resp.status}.`
    }

    respText = await resp.text()
    if (respText.indexOf('请勿频繁更新部署，稍等1分钟再试试看') != -1) {
      throw 'Do not deploy frequently, try again one minute later.'
    }

    return true
  }

  get_csrf_token (html) {
    const $ = cheerio.load(html)
    const eles = $('meta[name=csrf-token]')
    if (eles.length > 0) {
      return eles.eq(0).attr('content')
    } else {
      throw 'login gitee error, can not found csrf-token'
    }
  }
}

export default GiteePage
