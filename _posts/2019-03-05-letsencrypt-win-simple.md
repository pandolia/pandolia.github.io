---
title: IIS 下申请、部署及自动更新免费 SSL 证书
layout: post
feature_image: "/image/877.jpg"
category:
    - Devops
---

网站部署 HTTPS ，可以对浏览器和服务器之间的通讯数据进行加密，防止敏感信息（如：信用卡卡号、密码等）被中间攻击者窃取或篡改，防止网页内容被运行商或中间攻击者注入广告。此外， HTTPS 网站在搜索引擎中的排名也会比同等的 HTTP 网站更高。

<!--more-->

部署 HTTPS 需要先给网站域名申请一个经权威机构认证的 SSL 证书，目前绝大部分认证机构的 SSL 证书都是收费的，而且收费都很高。不过目前美国公益组织 ISRG（Internet Security Research Group，互联网安全研究小组）的 [Let's Encrypt](https://letsencrypt.org/) 上提供免费、自动化、开放的证书签发服务，对于一般的网站来说是够用了。

[Let's Encrypt](https://letsencrypt.org/) 提供的证书有效期 90 天，但可以免费更新。它的主页上提供了很多自动申请、配置和更新的官方工具，但都是基于 Linux 类系统的。对于 Windows/IIS 服务器，github 上有一个非常智能和强大的工具： [letsencrypt-win-simple](https://github.com/PKISharp/win-acme) ，基本上可以做到一键自动申请、配置和更新证书。本文介绍如何使用这个工具给网站部署 HTTPS 。

首先在 IIS 中部署好网站，将网站的主机名绑定为你的域名，带 www 的域名 www.xxx.com 、不带 www 的域名 xxx.com 、子域名 yyy.xxx.com 的格式都可以，一个网站可以绑定多个域名，也可以在一个系统中部署多个网站，但不同的网站必须绑定不同的域名。

将所有域名都解析到服务器 ip 上，并在服务器的防火墙上开通 80 和 443 端口的外部访问。之后在本地浏览器中访问所有域名（ http://www.xxx.com 等），确保所有网站、所有域名都可以正常访问。注意这时用 https://www.xxx.com 是无法访问的。

再到其 github 主页 <https://github.com/PKISharp/win-acme> 的 [release](https://github.com/PKISharp/win-acme/releases) 页下载最新的 win-acme-v2.x.x.x.zip ，放到服务器上，解压并在服务器上运行其中的 wacs.exe ，有的系统可能会提示缺少某个 .net 运行环境，可以根据提示的网址，下载 NDP472-KB4054531-Web.exe 安装，如果服务器上无法下载可以先在本地下好再拷贝到服务器。

运行 wacs.exe 后第一步有以下选项：

    N: Create new certificate
    M: Create new certificate with advanced options
    L: List scheduled renewals
    R: Renew scheduled
    S: Renew Specific
    A: Renew *all*
    O: More options...
    Q: Quit

这里直接回车，选第一个 “创建新证书” 。

第二步有以下选项：

    1: Single binding of an IIS site
    2. SAN certificate for all bindings of an IIS site
    3. SAN certificate for all bindings of multiple IIS sites
    4: Manually input host names

这里选第三项“给所有网站创建证书”。

之后就根据提示一步一步选择合适的选项就可以了，全部都完成后，程序会开始扫描出 IIS 下的所有网站和域名、验证域名的所有权、申请证书、给所有网站都配置好证书和 HTTPS 访问、并设置好自动检查和更新证书的计划任务，所有这一切都会自动的完成，完全不需要人工设置，相对智能和强大。

完成后，在本地访问 https://www.xxx.com 可以发现网站已经可以正常用 HTTPS 协议访问了，这时浏览器地址栏开头已经多了一个神奇的“小锁”，点开这个小锁之后，就可以看到证书的详细信息，示例如下：

![ca](/image/ca.png)

打开 IIS 也可以看到，每个网站它都贴心的帮你绑定了带 HTTPS 的主机名 https://www.xxx.com 。

证书里面最重要的信息一个是详细信息中的“使用者备用名称（DNS Name）”，这里面就包含了你的系统里面所有网站的域名，也就是这个证书所认证的域名，浏览器只有验证了证书的有效性以及用户所访问的网站的域名包含在证书上的 DNS Name 之后，才会允许后续的数据通讯。

另一个重要信息是详细信息中的指纹算法和指纹，这个是你的证书的特有的指纹，建议记下这个指纹，你申请的证书也可以在其他服务器中使用（比如： nginx 服务器证书、 ftps 服务器证书或 ssh 服务器证书） 这时可以通过这个指纹来确保证书没有被中间攻击者替换。

后面基本上就不需要做其他事情了，一切都由 wacs.exe 帮你搞定了，后续的证书过期前自动更新它也帮你搞定了，它自动增加了一个计划任务，每天 9 点自动检查证书是否即将过期，并自动更新即将过期的证书。

如果需要在其他类型的服务器使用这个证书，可以在 IIS 主页中的“服务器证书”模块中，点右边操作栏的“导出证书”，设置好导出路径和密码，导出 pfx 文件。之后用 openssl 可以将 pfx 文件中的“私钥”和“证书信息”提取出来，命令为：

    openssl pkcs12 -in a.pfx -out a.pem -nodes

提取之前需要输入导出时设置的密码。之后就可以在 a.pem 中看到 PRIVATE KEY 和 CERTIFICATE ，这两个也可以在其他的服务器中使用，只要你设置的服务器域名包含在证书中的域名就可以了，但要注意一定要保护好你的 PRIVATE KEY 。

例如，可以在 ftp 服务器软件 FileZilla Server 中的 ftps 选项中，设定好 PRIVATE KEY FILE 和 CERTIFICATE FILE 后。在本地用 wincap 连接 ftps://www.xxx.com ，这时 wincap 和 FileZilla Server 之间就可以用 FTPS 协议来传递数据了，传递数据之前 FileZilla Server 会将证书发给 wincap ，而 wincap 会像浏览器一样验证证书和域名，确保证书不被中间攻击者替换，保证数据通讯的安全。

注意：如果你在 wincap 中使用服务器 ip 而不是域名连接你的 ftp 服务器，这时 wincap 将认为该证书不是颁发给你所连接的服务器，它会打印出证书的指纹算法和指纹，让你自己选择是否相信此证书，此时，你可以人工对比该指纹和你的证书的指纹是否一致，如果一致，就表示证书在传输过程中未被替换，可以选择相信此证书。