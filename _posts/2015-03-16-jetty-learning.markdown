---
layout: post
title:  "长期学习中的JETTY"
date:   2015-02-04 16:58:57
published: true
categories: opensource
---


### 在 `IntelliJ IDEA` 中新建一个web项目

新建 maven 项目, 直接finish

右击项目名 选择 `Add Fromeworks Support` 勾选 `Web Application`  然后把根目录想的`web` 目录 改名`webapp` 并拖至 `main` 下
 
 
运行处点击 `Edit Configurations` 

然后点击左边添加按钮 `+`  选择 `Maven`

新maven插件下 Name 任意起

`Parameters` 下 `Command line` 填写 `org.mortbay.jetty:maven-jetty-plugin:6.1.22:run`

`Runner` 下 `VM Options` 填写 `-Djetty.port=8084`

关闭配置

`Preferences` 下 `Project Setting`设置 Maven ->`Maven home directory` 为 `/usr/local/maven/`(因人而异)


pom.xml 中配置

`build` `plugins`下

    <plugin>
         <groupId>org.eclipse.jetty</groupId>
         <artifactId>jetty-maven-plugin</artifactId>
         <version>9.2.1.v20140609</version>
    </plugin>
    
    ......
    
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>servlet-api</artifactId>
        <version>2.5</version>
    </dependency>
     
     
     

