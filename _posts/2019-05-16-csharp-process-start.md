---
title: c# 启动子进程的代码
layout: post
feature_image: "/image/898.jpg"
category:
    - Code-Snippet
---

**运行外部程序，等待其退出，类似 Python 的 os.system**

```csharp
using System;
using System.Diagnostics;

class Program
{
    public static int Exec(string file, string args = null, string dir = null, bool useShell = false)
    {
        try
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
        catch (Exception e)
        {
            Console.WriteLine(e);
            return 1;
        }
    }

    public static int Main(string[] args)
    {
        return Exec("python", "-c print('Hello')");
    }
}
```

**用指定用户创建子进程的时候**

设置用户后，会弹出一个独立的终端来运行子进程。好像没有方法可以让它直接在本进程的终端内运行。。。

设置用户时，工作目录必须设置为绝对路径，否则会相对于该用户的 home 目录来查找目录，可能会查找不到目录。

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