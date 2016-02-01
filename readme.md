---
title: 本博客源码使用说明
layout: post
category: 文章
---

**0. 说明**

本博客采用 [jekyll](http://jekyllrb.com/) 生成，托管在 [github](http://github.com) 上，网址为： <http://pandolia.github.io>，源码点 [这里](https://github.com/pandolia/pandolia.github.io) 。本博客的使用需要用到一点点`git`的知识，建议先学习一下 **git** 的使用方法，推荐 [廖雪峰的git教程](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000) 以及 [Scott Chacon 和 Ben Straub 的Git详解](http://git-scm.com/book/zh/v2) 。如果只是想写博客，也可以先不学，只使用本文后面提供的简单的命令。本站源码使用方法如下。

**1. 安装git，注册github帐号，新建博客仓库**

Windows用户可到 [git](http://git-scm.com/) 网站下载安装文件安装，Linux（Debian或Ubuntu）用户可用`sudo apt-get install git`命令安装。

之后到 [github](http://github.com) 首页注册一个帐号，记住用户名，后面将用`username`代表用户名。

注册完成且登陆后重新打开 [github](http://github.com) ，可在主页上的右下方找到一个绿色的`+ New repositories`的按钮，点击新建一个仓库（  **repositories** ），仓库名为 `username.github.io`，注意将 **username** 替换成你的用户名。

**2. 上传博客网站代码**

博客仓库`username.github.io`建立好后，博客地址就是 <http://username.github.io> ，但现在还不能访问，因为我们尚未上传任何的网页代码。

接下来先下载本站的源码，下载地址为：<https://github.com/pandolia/pandolia.github.io/archive/frame.zip>。

下载后解压到`username.github.io`目录下，之后， **cd** 到此目录，然后输入以下命令：

    git init
    git add .
    git commit -m "init-blog"
    git remote add origin https://github.com/username/username.github.io.git
    git push -u origin master

以上命令在当前目录下新建一个本地 **git仓库**，然后将当前目录下的代码全部添加至此仓库，再将本地仓库和 **github** 上的远程仓库`username.github.io`连接起来，最后将本地仓库的所有代码全部 **push** 到远程仓库。

现在就可以在浏览器中打开 <http://username.github.io> 了。

**3. 配置博客**

配置博客非常简单，打开`_config.yml`文件，内容如下：

    # Site settings
    title: Pandolia的博客
    description: > # this means to ignore newlines until "baseurl:"
      编程 算法 汇编 静态博客
    baseurl:  # the subpath of your site, e.g. /blog
    github_username:  pandolia

    # customer global variable
    navigation:
    - text: 主页
      url: /
    - text: 书签
      url: /bookmark.html
    - text: TinyC
      url: http://pandolia.net/tinyc
    - text: 简书
      url: http://www.jianshu.com/users/46fd9a28f80c/latest_articles
    - text: 本站源码
      url: https://github.com/pandolia/pandolia.github.io

仅需将其中的`title、description、github_username和navigation`修改成你想要的文字和链接就可以了。 **navigation** 稍微复杂一点，其中的 **text** 表示在导航栏中显示的文字， **url** 表示相应的链接。

修改完成后保存，再输入以下命令上传到 **github** ：

    git add .; git commit -m "update"; git push

之后再刷新一下浏览器就可以看到修改后的博客了。

**4. 写博客文章**

写博客文章也很简单，用 **markdown** 格式写好博文后，按`2016-01-31-filename.md`格式的文件名，保存到 **_post** 文件夹，再输入以下命令上传就可以了：

    git add .; git commit -m "update"; git push

但注意博文的开头需要增加以下内容：

    ---
    title: 本博客源码使用说明
    layout: post
    category: 文章
    ---

其中 **title** 为博文的标题， **layout** 不用修改， **category** 为博文的分类、可以改成你想要的其他文字。

**markdown** 语法非常简单易用，可参考：

- [Markdown 快速入门](http://wowubuntu.com/markdown/basic.html)
- [Wikipedia Markdown](https://en.wikipedia.org/wiki/Markdown)
- [Markdown Syntax Cheat Sheet](https://markable.in/file/aa191728-9dc7-11e1-91c7-984be164924a.html)

推荐用 [Markable](https://markable.in) 直接在网页上编辑 Markdown 文本，也可以使用 [Atom](https://atom.io) 在本地编辑。
