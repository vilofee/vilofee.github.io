---
layout: post
title:  "工程应用--服务器的压力测试解决方案"
date:   2015-02-06 16:58:57
published: true
categories: service-other
---

* 目录
{:toc}

# 单url的服务器压力测试

### boom ([github地址](https://github.com/rakyll/boom))

- 简要说明:


- 用法：

{% highlight html %}

Usage: boom [options...] [url]

Options:
  -n  Number of requests to run.
  -c  Number of requests to run concurrently. Total number of requests cannot
      be smaller than the concurency level.
  -q  Rate limit, in seconds (QPS).
  -o  Output type. If none provided, a summary is printed.
      "csv" is the only supported alternative. Dumps the response
      metrics in comma-seperated values format.

  -m  HTTP method, one of GET, POST, PUT, DELETE, HEAD, OPTIONS.
  -h  Custom HTTP headers, name1:value1;name2:value2.
  -t  Timeout in ms.
  -A  HTTP Accept header.
  -d  HTTP request body.
  -T  Content-type, defaults to "text/html".
  -a  Basic authentication, username:password.
  -x  HTTP Proxy address as host:port.

  -allow-insecure       Allow bad/expired TLS/SSL certificates.
  -disable-compression  Disable compression.
  -disable-keepalive    Disable keep-alive, prevents re-use of TCP
                        connections between different HTTP requests.
  -cpus                 Number of used cpu cores.
                        (default for current machine is 1 cores)
{% endhighlight %}


### apache benchmark

* 待追加


# 多url的随机压力测试

* 待追加
