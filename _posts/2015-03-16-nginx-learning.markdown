---
layout: post
title:  "长期学习中的NGINX"
date:   2015-02-04 16:58:57
published: true
categories: opensource
---

* 目录
{:toc}

## Install

目前我所使用的安装脚本

{% highlight sh %}

yum -y install gcc gcc-c++ autoconf automake
yum -y install zlib zlib-devel openssl openssl-devel pcre-devel

./configure --prefix=/usr/local/nginx \
--with-http_ssl_module \
--with-http_flv_module \
--with-http_gzip_static_module \
--http-log-path=/var/log/nginx/access.log \
--http-client-body-temp-path=/var/tmp/nginx/client \
--http-proxy-temp-path=/var/tmp/nginx/proxy \
--http-fastcgi-temp-path=/var/tmp/nginx/fcgi \
--with-http_stub_status_module

{% endhighlight %}


## sar常用命令

### install
{% highlight sh %}

yum -y install sysstat

{% endhighlight%}

### cpu

如 `sar -u 1 10`
间隔1秒取样10个 获取CPU使用情况

{% highlight  html %}

Linux 2.6.32-431.23.3.el6.x86_64 (logs) 	2015年08月28日 	_x86_64_	(2 CPU) <!---->

11时02分01秒     CPU     %user     %nice   %system   %iowait    %steal     %idle
11时02分02秒     all      3.00      0.00      1.50      0.00      0.00     95.50
11时02分03秒     all      3.03      0.00      0.51      0.00      0.00     96.46
11时02分04秒     all      3.54      0.00      0.51      0.00      0.00     95.96
11时02分05秒     all     34.67      0.00      3.52      0.00      0.00     61.81
11时02分06秒     all      2.53      0.00      1.01      8.59      0.00     87.88
11时02分07秒     all      2.01      0.00      1.01      0.00      0.00     96.98
11时02分08秒     all      3.02      0.00      0.50      0.00      0.00     96.48
11时02分09秒     all      3.52      0.00      1.51      0.00      0.00     94.97
11时02分10秒     all      3.02      0.00      1.01      0.00      0.00     95.98
11时02分11秒     all      3.00      0.00      1.00      2.50      0.00     93.50
平均时间:     all      6.13      0.00      1.21      1.11      0.00     91.55

{% endhighlight %}

说明

CPU：all 表示统计信息为所有 CPU 的平均值。

%user：显示在用户级别(application)运行使用 CPU 总时间的百分比。

%nice：显示在用户级别，用于nice操作，所占用 CPU 总时间的百分比。

%system：在核心级别(kernel)运行所使用 CPU 总时间的百分比。

%iowait：显示用于等待I/O操作占用 CPU 总时间的百分比。 若 %iowait 的值过高，表示硬盘存在I/O瓶颈

%steal：管理程序(hypervisor)为另一个虚拟进程提供服务而等待虚拟 CPU 的百分比。

%idle：显示 CPU 空闲时间占用 CPU 总时间的百分比。若 %idle 的值高但系统响应慢时，有可能是 CPU 等待分配内存，此时应加大内存容量。若 %idle 的值持续低于1，则系统的 CPU 处理能力相对较低，表明系统中最需要解决的资源是 CPU 。



