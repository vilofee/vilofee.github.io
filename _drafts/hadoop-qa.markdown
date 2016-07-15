---
layout: post
title:  "HADOOP学习过程中遇到的问题汇总"
date:   2015-12-30 16:58:57
categories: feel
---

### 教材《HADOOP权威指南》

* 目录
{:toc}

----

####Q1:启动hadoop后(dfs,mapred),发现监控namenode的50070端口无法访问，而50030是ok的

Answer:
在关闭掉dfs，mapred 后执行 `hadoop namenode -format` 后，问题解决。

----

####Q2:使用第二章讲MR的气温示例时,maven打包遇到包com.sun.tools.classpath缺失 问题

Answer:
通过配置pom.xml

{%highlight xml%}
<dependency>
    <groupId>com.sun</groupId>
    <artifactId>tools</artifactId>
    <version>1.7.0</version>
    <scope>system</scope>
    <systemPath>/Library/Java/JavaVirtualMachines/jdk1.7.0_55.jdk/Contents/Home/lib/tools.jar</systemPath>
</dependency>
{%endhighlight%}

可以正常打包

####Q3:部署第二章MR的气温示例时，执行书中的部署命令失败
Answer: 
书中的部署命令

    % export HADOOP_CLASSPATH=/dir/dir1
    % hadoop MaxTemperature input/file/path.txt output/

直接提示找不到MaxTemperature

参考网络上

    % hadoop jar MaxTemperature.jar pachage.MaxTemperature input/file/path.txt output/

提示的应该意指找不到节点下的input文件

普通java执行方式

    % java -cp MaxTemperature.jar pachage.MaxTemperature input/file/path.txt output/

得到结果。

注意到书中是说以独立(本机)方式安装Hadoop 而我是以伪分布方式安装的 猜想是这个不同引起的差别。

先放弃解决此问题，继续学习寻求解决方式。



