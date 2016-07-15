---
layout: post
title:  "php结合fabric在windows下的环境搭建"
date:   2015-05-25 11:05:35
published: true
categories: feel
---


* 目录
{:toc}

* 以下工具安装时版本应该匹配，错误的版本号可能导致后续工具安装失败。

* cygwin的卸载稍微复杂，需要注意安装时尽量小心。

* 以下所有工具均已经上传到我的115网盘中，如有需要可以留言获取。

### 安装cygwin

需要打开 gcc , g++, openssh, openssl, vim

### 安装python

建议使用version 2.7.3（2.7.9+ 与后续工具版本不匹配）。

[python 2.7.3 官方下载地址](https://www.python.org/download/releases/2.7.3/)

添加环境变量 path = C:\Python27 (你的python地址)

### 安装setuptools
setuptools-5.1.zip 解压缩

{%highlight sh%}

cd setuptools-5.1
python setup.py install

{%endhighlight%}

    
###    安装pip
   
源码安装的话pip可以选择不安装
下载 pip pip-1.0.2.tar.gz,解压 pip-1.5.6.tar.gz

{% highlight sh %}

tar zxf pip-1.5.6.tar.gz
cd pip-1.5.6
python setup.py install

{% endhighlight %}

添加环境变量 path = C:\Python27\Scripts
    
### 安装 pycrypto-2.6.win-amd64-py2.7

直接运行 pycrypto-2.6.win-amd64-py2.7.exe
    
### Paramiko SSH library模块安装

{% highlight sh %}


tar zxf paramiko-1.7.7.1.tar.gz
cd paramiko-1.7.7.1
python setup.py install

{% endhighlight %}

### 安装fabric
    
下载地址：https://pypi.python.org/pypi/Fabric/1.9.0
    
{%highlight sh%}

tar zxf Fabric-1.9.0.tar.gz
cd Fabric-1.9.0
python setup.py install
    
{%endhighlight%}
    
    
### ssh
    
执行

{% highlight sh %}

ssh-keygen -t rsa 

{% endhighlight%}

所有提示均选择回车默认设置，则生成无密码的公钥 id\_rsa.pub, 私钥 id\_rsa

移动至/home/XXXX/.ssh/

/home/XXXX/.ssh/config以如下格式分组配置

{% highlight sh %}
Host online
HostName 10.10.10.10
User share
{% endhighlight %}

执行

{%highlight sh %}

ssh online # 可以访问share权限下的10.10.10.10

ssh root@online # 可以访问root 权限下的10.10.10.10

{%endhighlight%}

至此 fabric 的在cygwin 下执行的环境已经搭建完成。
    
