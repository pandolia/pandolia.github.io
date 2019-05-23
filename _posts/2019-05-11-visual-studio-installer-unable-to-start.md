---
title: visual studio installer 无法启动
layout: post
feature_image: "/image/898.jpg"
category:
    - Code-Snippet
---

系统中已安装了 visual studio 2017 ，最近不知道什么原因， visual studio 2017 installer 无法启动了，导致无法再增加或删减模块了，甚至无法卸载这个 installer 。下载了最新的 visual studio 2019 安装文件，也是无法启动，安装文件在解压后运行一段时间就直接退出了，什么错误都没报。折腾了两天，试了很多方法，最后才用下面的方法得以解决：

1\. 运行安装文件 vs_community__xxx.exe 。

2\. 等它退出后，找到 C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe ，右键改文件打开文件属性对话框，在“兼容性”设置里，勾选 “禁用视觉主题” 和 “禁用桌面元素” 。

3\. 重新运行 vs_community__xxx.exe 。