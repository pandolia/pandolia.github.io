---
title: Windows 系统编程（ 1 ）
layout: post
feature_image: "/image/865.jpg"
category:
    - System Programming
---

一、 Visual Studio Installer 无法启动的问题

系统中已安装了 visual studio 2017 ，最近不知道什么原因， visual studio 2017 installer 无法启动了，导致无法再增加或删减模块了，甚至无法卸载这个 installer 。下载了最新的 visual studio 2019 安装文件，也是无法启动，安装文件在解压后运行一段时间就直接退出了，什么错误都没报。最后采用下面的方法得以解决：

<!--more-->

1\. 运行安装文件 vs_community__xxx.exe 。

2\. 等它退出后，找到 C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe 文件，右键该文件打开文件属性对话框，在“兼容性”设置里，勾选 “禁用视觉主题” 和 “禁用桌面元素” 。

3\. 重新运行 vs_community__xxx.exe 。


二、 C# 启动子进程的代码

1、 运行外部程序，等待其退出，类似 Python 的 os.system

```csharp
using System;
using System.Diagnostics;

class Program
{
    public static int Exec(
        string file, string args = null, string dir = null, bool useShell = false
    )
    {
        using (var p = new Process())
        {
            p.StartInfo.FileName = file;
            p.StartInfo.Arguments = args;
            p.StartInfo.WorkingDirectory = dir;
            p.StartInfo.UseShellExecute = useShell;
            p.Start();
            p.WaitForExit();
            return p.ExitCode;
        }
    }

    public static int Main(string[] args)
    {
        return Exec("python", "-c print('Hello')");
    }
}
```

2、 用指定用户创建子进程

```csharp
using System.IO;
using System.Diagnostics;
using System.Security;

class Program
{
    public static SecureString ToSecureString(string text)
    {
        SecureString ss = new SecureString();
        foreach (var c in text)
        {
            ss.AppendChar(c);
        }
        return ss;
    }

    public static void Main()
    {
        var psi = new ProcessStartInfo();
        psi.FileName = "python";
        psi.Arguments = "-c print('hello');raw_input()";
        psi.WorkingDirectory = Path.GetFullPath("."); // must be absolute path

        psi.Domain = "??";
        psi.UserName = "??";
        psi.Password = ToSecureString("??");
        psi.LoadUserProfile = true;
        psi.UseShellExecute = false;

        var p = new Process();
        p.StartInfo = psi;
        p.Start();
    }
}
```
注意：

1\. 设置用户时，工作目录必须设置为绝对路径，否则会相对于该用户 home 目录来查找目录。

2\. 设置用户后，会弹出一个独立的终端来运行子进程。好像没有方法可以让它直接在本进程的终端内运行。

三、 处理控制键事件的代码

```C
BOOL WINAPI HandlerRoutine(DWORD dwCtrlType) {
    switch (dwCtrlType)
    {
    case CTRL_C_EVENT:
        printf("[Ctrl]+C\n");
        isRunnung = false;
        // Signal is handled - don't pass it on to the next handler
        return TRUE;
    default:
        // Pass signal on to the next handler
        return FALSE;
    }
}

int main(int argc, _TCHAR* argv[])
{
    // SetConsoleCtrHandler(NULL, TRUE); // ignore any ctrl key

    SetConsoleCtrlHandler(HandlerRoutine, TRUE);

    printf("Starting\n");
    while ( isRunnung ) {
        Sleep(1);
    }
    printf("Ending\n");

   return 0;
}
```