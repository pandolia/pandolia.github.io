---
title: windows server 管理（ 1 ）
layout: post
feature_image: "/image/863.jpg"
category:
    - Devops
---


一、 用脚本将路径自动添加至系统路径

方法 1 ，用 setx 命令：

```batch
setx -m PATH %PATH%;%~dp0
```

其中 %~dp0 表示脚本文件所在的路径。但这种方法有个限制，最终的 PATH 最长不能超过 1024 个字符。

<!--more-->

方法 2 ，用 powershell ：

```batch
powershell -c [Environment]::SetEnvironmentVariable('Path',[Environment]::GetEnvironmentVariable('Path','Machine')+';%~dp0','Machine')
```


二、 Windows 服务管理

```batch
:: 安装服务（一般不指定用户，直接以 SYSTEM 用户运行，当指定用户时，必须先授权该用户运行服务的权限）
sc create "service-name" binPath= "xx.exe args" start= auto obj= "domain\username" password= "password"

:: 启动、停止、删除服务
sc start|stop|delete "service-name"
```

三、 IIS 中部署单页应用

1、 安装 URL 重写工具，可到 [iis-url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) 页面的底部下载离线安装包安装，也可以直接用 Web 平台安装程序安装。

2、 网站增加一条重写规则，匹配规则为 **^[^.]+$** ，动作为 **重写（Rewrite）** ，重写目标为 **/index.html** （说明： 所有 pathname 中不带 **.** 的请求，例如 /xxx/yy/zz ，都会直接返回 index.html 的内容，但如果带 **.** 则视为文件请求，不进行重写，只进行文件搜索）。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="return-index.html-for-front-route" enabled="true">
                    <match url="^[^.]+$" ignoreCase="false" />
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

四、 设置 powershell 脚本文件的执行策略

参考： [about_execution_policies](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-6) 、 [set-executionpolicy](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-6) 。

```powershell
Set-ExecutionPolicy AllSigned|ByPass|Restricted...
```

五、 powershell 压缩、解压脚本

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

六、 WinRAR 压缩、解压（带密码）

```batch
REM Zip: 
WinRAR\Rar.exe a -r -hpPASSWORD destination.rar source_file_or_directory

REM Unzip:
WinRar\Rar.exe x -hpPASSWORD source.rar destination_directory
```