---
layout: post
title:  "Nginx-简要介绍"
date:   2015-02-04 16:58:57
published: true
categories: service-nginx
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




