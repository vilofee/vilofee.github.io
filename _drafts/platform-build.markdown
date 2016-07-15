layout: post
title:  "平台搭建"
date:   2015-02-04 16:58:57
published: false
categories: opensource
---

* 目录
{:toc}


## zabbix 监控平台系统

### 准备

* zabbix-2.4.6包

### zabbix-server服务安装

1. 增加zabbix用户

        groupadd zabbix -g 201
        useradd -g zabbix -u 201 -m zabbix
        
2. 编译安装zabbix

        mkdir -p /usr/local/zabbix
        ./configure --prefix=/usr/local/zabbix --sysconfdir=/etc/zabbix --enable-server --enable-proxy --enable-agent --enable-ipv6 --with-mysql=/usr/bin/mysql_config --with-net-snmp --with-libcurl --with-openipmi --with-unixodbc --with-ldap --with-ssh2 --enable-java
        
        make&make install
        
    结果:
    
        [root@release zabbix]# ls /usr/local/zabbix/
        bin  lib  sbin  share
        
    根据下面提到的问题应该提前安装的扩展
        
        yum -y install mysql-devel unixODBC-devel net-snmp-devel libssh2-devel OpenIPMI-devel openldap-devel
    
    出现问题:
        
        checking for mysql_config... /usr/bin/mysql_config
        configure: error: MySQL library not found
        
    解决
        
        yum install -y mysql-devel
    
    出现问题:
        
        checking for odbc_config... no
        checking for main in -lodbc... no
        configure: error: unixODBC library not found
    
    解决
    
        yum -y install unixODBC-devel
        
    出现问题:
        
        checking for net-snmp-config... no
        configure: error: Invalid Net-SNMP directory - unable to find net-snmp-config
    
    解决:
        
        yum -y install net-snmp-devel
        
    出现问题:
        
        configure: error: SSH2 library not found
    
    解决:
    
        yum -y install libssh2-devel
    
    出现问题:
    
        configure: error: Invalid OPENIPMI directory - unable to find ipmiif.h
    
    解决:
        
        yum -y install OpenIPMI-devel

    出现问题:
    
        checking for LDAP support... no
        configure: error: Invalid LDAP directory - unable to find ldap.h
    
    解决:
    
        yum -y install openldap-devel

3. 配置
    1. 端口配置
    
        vim /etc/services 增加
        zabbix-agent    10050/tcp                       # Zabbix Agent
        zabbix-agent    10050/udp                       # Zabbix Agent
        zabbix-trapper  10051/tcp                       # Zabbix Trapper
        zabbix-trapper  10051/udp                       # Zabbix Trapper
    
    2. mysql准备工作
        
        mysqladmin -uroot password 'mypassword'; # 设置mysql的root密码
        mysql -uroot -p mypassword  # 登录数据库
        create database zabbix character set utf8  # 建库,建议独立库.字符一定是utf8
        grant all privileges on zabbix.* to zabbix@localhost identified by 'zabbix';  # 为zabbix用户赋予权限, 引号内zabbix为密码
        flush privileges;  # 使权限变更生效
        mysql -uzabbix -pzabbix zabbix 尝试登录zabbix测试连接是否正常.
    
    3. 导入数据到zabbix数据库
    
        cd Path/zabbix-2.4.6
        
        mysql -uzabbix -pzabbix zabbix < ./database/mysql/schema.sql
        mysql -uzabbix -pzabbix zabbix < ./database/mysql/images.sql 
        mysql -uzabbix -pzabbix zabbix < ./database/mysql/data.sql
        
    4. 日志目录
    
        mkdir /var/log/zabbix
        chown zabbix.zabbix /var/log/zabbix
        
    5. 启动脚本
    
        cp ./misc/init.d/fedora/core/zabbix_* /etc/init.d/
        chmod 755 /etc/init.d/zabbix_*
        
        更改zabbix_server zabbix_agentd脚本
        BASEDIR=/usr/local/zabbix
        
    6. 配置文件
    
        [root@dev zabbix]# cat /etc/zabbix/zabbix_server.conf|grep -v ^"$" |grep -v ^"#"
        LogFile=/tmp/zabbix_server.log
        DBHost=127.0.0.1
        DBName=zabbix
        DBUser=zabbix
        DBPassword=zabbix
        DBPort=3306
        AlertScriptsPath=/etc/zabbix/alertscripts
        
        创建/etc/zabbix/alertscripts 用于存放报警脚本
        
        [root@dev alertscripts]# cat /etc/zabbix/zabbix_agentd.conf|grep -v ^"$" |grep -v ^"#"
        LogFile=/tmp/zabbix_agentd.log
        Server=127.0.0.1
        ServerActive=127.0.0.1
        Hostname=bantang-dev
        Include=/etc/zabbix/zabbix_agentd.conf.d/
        UnsafeUserParameters=1
    
    
    7. 网页文件处理 
    
        cp frontends/php/  WebRoot/zabbix
        浏览器访问该地址,改变不符合的php配置.
        
        通过phpize方式更新相关扩展, database 指 ext/mysqli扩展
    
        更改 WebRoot/zabbix/conf的zabbix配置.
    
    8. 启动server服务.
    
        chkconfig zabbix_server on
        chkconfig zabbix_agentd on
        service zabbix_server start
        service zabbix_agentd start
    
    9. 安装完成
    
### zabbix_agentd服务安装
    
1. 安装
    
        groupadd zabbix -g 201
        useradd -g zabbix -u 201 -m zabbix
        ./configure --prefix=/usr/local/zabbix --sysconfdir=/etc/zabbix --enable-agent
        make 
        make install

2. 配置
    
        cp misc/init.d/fedora/core/zabbix_agentd /etc/init.d/
        chmod 755 /etc/init.d/zabbix_agentd
        
        vim /etc/services 增加
        zabbix-agent    10050/tcp                       # Zabbix Agent
        zabbix-agent    10050/udp                       # Zabbix Agent
        zabbix-trapper  10051/tcp                       # Zabbix Trapper
        zabbix-trapper  10051/udp                       # Zabbix Trapper
        
        
        更改zabbix_agentd脚本
        BASEDIR=/usr/local/zabbix


        
    
    

