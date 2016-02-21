---
layout: post
title: Debian安装和使用
category: 笔记
---

### 1. 系统安装
**（1） 在Vitualbox中安装Debian8（xfce）**

见 [mralphaville的Blog](https://mralphaville.wordpress.com/2015/05/01/how-to-install-debian-8-jessie-as-a-virtual-machine) 。

**（2） 在Windows下通过U盘安装Debian 7.0 Wheezy**

首先通过 <http://www.debian.org/distrib/netinst>, 在 Tiny CDs, USB sticks, etc. 下面, 找到对应的下载列表, 如x86-64bit, 则选择：<http://ftp.nl.debian.org/debian/dists/wheezy/main/installer-amd64/current/images> 点击左侧列表里的 hd-media , 下载其中的boot.img.gz, 其他的都不用下。

在windows下, 解开boot.img.gz, 会得到一个img文件。用`UltraISO`, “启动”->”写入硬盘镜像”, 选择你的U盘, 写入方式使用USB-HDD, 将这个img 写到U盘上。

成功后, “便捷启动”-> “写入新的硬盘主引导记录MBR” -> USB-HDD。

再下载你需要安装的ISO, 在  <http://www.debian.org/distrib/netinst> 的 Small CDs 下面选择合适你的系统的ISO文件,下载后,将这个ISO文件复制到你的U盘根目录下。

然后将电脑设置为U盘启动, 就可以看到Debian的安装界面了。

**（3） 用Grub通过硬盘安装Debian8.2.0**

电脑中已经安装了Win7和Debian7双系统，用Grub启动。则可以用Grub从硬盘安装Debian8。

首先下载安装`镜像文件debian-8.2.0-amd64-DVD-1.iso`，到[这里](http://cdimage.debian.org/debian-cd/8.2.0/amd64/iso-dvd)下载。然后下载内核引导程序文件`initrd.gz` 和`vmlinuz` ，到[这里](http://ftp.nl.debian.org/debian/dists/Debian8.2/main/installer-amd64/current/images/hd-media)下载。注意`initrd.gz`和`vmlinuz`的版本必须和`镜像iso文件`的版本一致。

内核引导程序文件（`initrd.gz`和`vmlinuz`）可以放在硬盘的任何分区的任意目录，但`安装镜像文件debian-8.2.0-amd64-DVD-1.iso`必须放在FAT32或EXT文件系统的分区（否则内核引导程序无法识别出镜像文件）。这里为方便起见，假定电脑中D盘为FAT32文件系统，把这三个文件全部放在D盘的根目录下。若硬盘中没有FAT32分区，可以用Win7自带的磁盘管理新建一个FAT32分区。

之后在Debian系统下编辑`/boot/grub/grub.cfg`，在该文件的最后增加一个启动项：

    menuentry "Debian DVD 8.2.0" {
        linux (hd0,msdos5)/vmlinuz
        initrd (hd0,msdos5)/initrd.gz
    }

这里`(hd0,msdos5)`代表硬盘的上的`msdos5分区`，即`D盘`。分区编号规则为：主分区（C盘）为msdos，第一个逻辑分区（D盘）为msdos5，第二个逻辑分区（E盘）为msdos6...（可以在Grub启动电脑时，按`c键`进入命令行模式，运行`ls命令`可以查看所有分区）。

`grub.cfg`文件修改完毕保存，重启电脑就可以看到Grub启动菜单中多了一个`Debian DVD 8.2.0`的启动项了，进入这个启动项就开始安装Debian8了。这里千万要注意不能将Debian安装到镜像iso文件所在的分区上，否则已安装的系统都会挂掉。

`grub.cfg`文件中的`linux (hd0,msdos5)/vmlinuz`和`initrd (hd0,msdos5)/initrd.gz`命令指定了内核引导程序文件所在的位置，Grub会加载这两个文件中的引导程序，之后引导程序会在硬盘的所有FAT32和EXT分区中搜索安装镜像iso文件，搜索到合法的安装镜像文件后会自动启动iso文件开始安装。

### 2. 软件安装及配置
**配置源：**

    $ nano /etc/apt/sources.list
    ... # 只保留以下两行:
    deb http://ftp.cn.debian.org/debian jessie-backports main
    deb http://http.debian.net/debian/ jessie main contrib non-free
    $ apt-get update

**中文输入：**

    $ apt-get install ibus ibus-sunpinyin
    $ nano ~/.bashrc
    ... # 添加以下命令:
    export GTK_IM_MODULE=ibus
    export XMODIFIERS=@im=ibus
    export QT_IM_MODULE=ibus

之后需要设置输入法切换快捷键， **xfce** 下可以很快找到输入法管理程序，但 **gnome** 下藏的很隐蔽，在 settings --> keyboard --> typing --> input source 里面设置。

**开发工具：**

    aptitude install build-essential
    apt-get install git gdb nasm
    apt-get install python-dev
    apt-get install python-pip
    apt-get install mysql-server
    pip install mysql-connector-python

注意安装 **build-essential** 时，由于系统自带的 **libc** 包和源中的版本不一致，会导致冲突，必须使用 **aptitude** 命令安装，安装过程中根据提示对 **libc** 进行 **downgrade** ，之后才能正常安装。

**ruby和jekyll安装：**

    $ apt-get install ruby ruby-dev
    $ gem sources --remove https://rubygems.org/
    $ gem sources -a https://ruby.taobao.org/
    $ gem sources -l
    *** CURRENT SOURCES ***
    https://ruby.taobao.org
    # 请确保只有 ruby.taobao.org
    $ gem install jekyll

**iceweasel 的 flash player 插件安装：**

    $ apt-get install flashplugin-nonfree   # 安装
    $ update-flashplugin-nonfree --install  # 更新

**lantern 安装：**

    $ apt-get install libappindicator1 libappindicator3-1
    $ dpkg -i google-chrome-stable_current_amd64.deb

其中 **google-chrome-stable_current_amd64.deb** 需要到[ lantern 官网](https://github.com/getlantern/lantern)下载。 **gnome** 下用 **chrome** 和 **iceweasel** 都可以连外网；但在 **xfce** 下却无法使用 **chrome** 连接，好在系统自带的 **iceweasel** 是可以用的。

**VirtualBox增强功能安装**

    $ uname -a
    $ apt-get install linux-headers-3.16.0-4-amd64   # linux-headers的版本根据 uname 命令得到
    $ sh ./VBoxLinuxAdditions.run                    # 先 cd 到 VBoxLinuxAdditions 的光盘目录
    $ usermod -a -G vboxsf yourname                  # 把 yourname 增加到 vboxsf 组中，这样 yourname 用户也能使用共享文件夹了

**时区和时间设置**

设置时区：`dpkg-reconfigure tzdata`，设置时间：`date -s 20160212; date -s 21:24:06`。
