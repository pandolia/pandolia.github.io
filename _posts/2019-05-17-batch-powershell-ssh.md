---
title: window 的 batch 和 powershell 脚本代码
layout: post
feature_image: "/image/898.jpg"
category:
    - Code-Snippet
---

**Windows 服务管理**

```batch
:: 安装服务（一般不指定用户，直接以 SYSTEM 用户运行，当指定用户时，必须先授权该用户运行服务的权限）
sc create "service-name" binPath= "xx.exe args" start= auto obj= "domain\username" password= "password"

:: 启动、停止、删除服务
sc start|stop|delete "service-name"
```

**SSH 配置公钥登录**

（1） 检查一下服务器的 ssh 配置文件 **/etc/ssh/sshd_config** （ Windows OpenSSH 下，配置文件在 **C:\ProgramData\ssh\sshd_config** ）。

```
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
GatewayPorts yes
```

对于 Windows OpenSSH ，需要注意要把配置文件中的下面两行注释掉：

```
# Match Group administrators
#       AuthorizedKeysFile __PROGRAMDATA__/ssh/administrators_authorized_keys
```

修改配置后重启 sshd 服务。

（2） 在客户端生成公钥和私钥：

```
cd ~/.ssh
ssh-keygen -t rsa
```

生成过程中会要求输入一个文件名，建议这里输一个名字（比如 my_id），之后会在 ~/.ssh 下生成公钥文件 my_id 和私钥文件 my_id.rsa 。注意一定要保护好你的私钥。

之后在客户端的 ~/.ssh 下新建一个 config 文件，输入以下内容，给公网服务器建立一个别名 myhost 。

Host myhost
    HostName www.xxx.com
    User user
    IdentityFile ~/.ssh/my_id

最后，将公钥 my_id 中内容加入到服务器上 ~/.ssh/authorized_keys 文件的最后一行（如果该文件不存在，则新建一个），并设置好该文件的权限，确保该文件只能被管理员和本用户看到和编辑。

最后，在客户端执行 ssh myhost 就可以成功登录了。

之后也可以通过 ftp 客户端 WinSCP 登录 myhost ，浏览 myhost 上的文件。

scp 命令：

```sh
# download: remote -> local
scp user@remote_host:remote_file local_file 

# upload: local -> remote
scp local_file user@remote_host:remote_file
```

如果需要拷贝整个目录，则加上 **-r** 参数。

**ssh端口转发**

内网服务器 A ，ip 192.168.1.125，在 80 端口运行 http 服务。已安装 ssh 客户端。

公网服务器 B ，ip 45.32.127.32，已开启 sshd 服务。

在公网服务器 B 上开启 sshd **GatewayPorts yes** 的配置，修改配置文件后需重启 sshd 服务。

在内网服务器 A 上运行：

```sh
ssh -fNR 8000:192.168.1.125:80 administrator@45.32.127.32
```

这样就把内网 192.168.1.125:80 端口暴露到公网  45.32.127.32:8000 端口了，之后访问公网地址 http://45.32.127.32:8000 就可以访问到内网服务器 A 中的 http 服务了。

这条命令在本地（A）和 远程服务器（B）之间建立了一条反向隧道，具体过程为：

1、 本地启动 ssh 进程；

2、 ssh 进程登录远程服务器，命令远程服务器 sshd 进程开始监听 8000 端口；

3、 sshd 在 8000 端口上接收到的任何连接请求都会转发到本地的 ssh 进程，ssh 进程再将连接请求转发到 192.168.1.125:80 端口。

参数 R 表示建立反向隧道， N 表示不在远程服务器上执行命令， f 表示在后台运行 ssh ，即便关闭终端，ssh 都会在后台运行。

-R 参数格式：

```sh
-R 远程监听网卡地址:端口:本地转发地址:端口
```

其中的远程监听网卡地址一般可以省略，使用默认网卡。注意此处即便写成 -R 127.0.0.1:8000:192.168.1.125:80 ，8000 端口仍然可以通过 45.32.127.32:8000 访问。

这里还可以把 192.168.1.125:80 改成 A 所在局域网的其他服务器 ip:port ，将 A 能访问到的其他服务器的端口暴露到公网。

如果不想让所有人都访问这个服务，可以在公网服务器的防火墙上关闭 8000 端口，这样这个端口就只能在公网服务器上访问了。

然后在另一个局域网的内网服务器 C （可以访问到公网服务器 B ，但访问不到内网服务器 A ），运行：

```sh
ssh -fNL 80:45.32.127.32:8000 administrator@45.32.127.32
```

这样就把公网 45.32.127.32:8000 端口暴露到内网服务器 C 的本地 80 端口了，之后在 C 访问 http://127.0.0.1:80 就相当于访问 http://45.32.127.32:8000 。

这条命令在本地（C）和 远程服务器（B）之间建立了一条正向隧道，具体过程为：

1、 本地启动 ssh 进程，登录远程服务器，

2、 本地 ssh 进程开始监听 80 端口，任何发向此端口的连接请求都由 ssh 进程会转发到远程服务器的 sshd 进程，sshd 进程再将连接请求转发到 45.32.127.32:8000 端口。

这里同样可以将 45.32.127.32:8000 改成其他地址和端口（只要 B 可以访问到）。

-L 参数格式：

```sh
-L 本地监听网卡地址:端口:远程转发地址:端口
```

另外还有一个动态端口转发：

```sh
ssh -D 0.0.0.0:8888 user@host
```

在本地 0.0.0.0:8888 端口运行了一个 socks5 代理服务器，之后可以在 FireFox 浏览器中配置 socks5 代理服务器地址和端口为 127.0.0.1:8888 ，浏览器任何请求都先发到本地 8888 端口（本地 ssh 进程）， ssh 进程转发到远程服务器 sshd 进程，最后由远程 sshd 进程发起实际的连接，并将请求数据原路返回给本地的浏览器。

这里同样可以省略地址 0.0.0.0 。

**用脚本将路径自动添加至系统路径**

方法一，用 setx 命令：

```batch
setx -m PATH %PATH%;%~dp0
```

其中 %~dp0 表示脚本文件所在的路径。

这种方法有个限制就是最长不能超过 1024 个字符。

方法二，用 powershell ：

```batch
powershell -c [Environment]::SetEnvironmentVariable('Path',[Environment]::GetEnvironmentVariable('Path','Machine')+';%~dp0','Machine')
```

**IIS 中部署单页应用**

1、 安装 URL 重写工具，可到 https://www.iis.net/downloads/microsoft/url-rewrite 页面的底部下载离线安装包安装，也可以直接用 Web 平台安装程序安装。

2、 网站增加一条重写规则，匹配规则为 **^[^.]+$** ，动作为 **重写（Rewrite）** ，重写目标为 **/index.html** （说明： 所有 pathname 中不带 **.** 的请求，例如 /xxx/yy/zz ，都会直接返回 index.html 的内容，但如果带 **.** 则视为文件请求，不进行重写，只进行文件搜索）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="return-index.html-for-all-front-route" enabled="true">
                    <match url="^[^.]+$" ignoreCase="false" />
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

**设置 powershell 脚本文件的执行策略**

参考： 

https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-6

https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-6

``powershell
Set-ExecutionPolicy AllSigned|ByPass|Restricted...
``

**powershell 压缩、解压脚本**

zip.ps1:

```powershell
# .\zip.ps1 source_directory dest.zip
param (
    [parameter(Position=0, Mandatory=$true)] [String] $source,
    [parameter(Position=1, Mandatory=$true)] [String] $destination
)
if (Test-Path $destination) { Remove-Item -Force -Recurse $destination }
Add-Type -assembly 'system.io.compression.filesystem'
[io.compression.zipfile]::CreateFromDirectory($source, $destination)
```

unzip.ps1

```powershell
# .\unzip.ps1 source.zip dest_directory

param (
    [parameter(Position=0, Mandatory=$true)] [String] $source,
    [parameter(Position=1, Mandatory=$true)] [String] $destination
)
if (Test-Path $destination) { Remove-Item -Force -Recurse $destination }
New-Item -Type Directory $destination
Add-Type -assembly 'system.io.compression.filesystem'
[io.compression.zipfile]::ExtractToDirectory($source, $destination)
```

**WinRAR 压缩、解压（带密码）**

```batch
REM Zip: 
WinRAR\Rar.exe a -r -hpPASSWORD destination.rar source_file_or_directory

REM Unzip:
WinRar\Rar.exe x -hpPASSWORD source.rar destination_directory
```