layout: post
title:  "后端开发维护遇到的各种应用问题"
date:   2015-03-03 15:56:57
categories: feel
---

* 目录
{:toc}


### Mac下关于产生 "您需要安装旧 Java SE 6 运行环境才能打开..."的问题的解决方法

有两种解决办法：

1、下载：适用于 OS X 的 [Java 2014-001](http://support.apple.com/kb/DL1572?viewlocale=zh_CN&locale=en_US)，安装即可解决。

2、打开/Applications/XXXX/Contents/Info.plist, 搜索JVMVersion，将其值改为1.7*

3、在解决过程中发现，使用第二种方法可以解决Jetbrains系列IDE出现的这个问题，无法解决 charles的该问题。使用第一种方法可以完美解决如上问题。


### php enable php-fpm遇到的一个问题

执行

{% highlight sh %}

./configure --prefix=/usr/local/php  --enable-fpm --with-mcrypt \
  --enable-mbstring --disable-pdo --with-curl --disable-debug  --disable-rpath \
  --enable-inline-optimization --with-bz2  --with-zlib --enable-sockets \
  --enable-sysvsem --enable-sysvshm --enable-pcntl --enable-mbregex \
  --with-mhash --enable-zip --with-pcre-regex --with-mysql --with-mysqli \
  --with-gd --with-jpeg-dir --with-openssl
 

{% endhighlight %}

遇到报错

{% highlight html %}

configure: error: jpeglib.h not found.

{% endhighlight %}

原因是gd下需要自行安装gd库

前往[苹果官方开源支持](http://www.apple.com/opensource/) 查找并下载GD需要的 `zlib/libpng/jpeg/freetype/libgd`

安装之。


* 不过应该enable php-fpm 一定需要打开gd支持？这个需要确认下。


# php 的安装configure 参数

执行

{% highlight sh %}

  // 单纯打开fpm：
  ./configure --prefix=/usr/local/php  --enable-fpm  
  
  yum -y install libmcrypt-devel curl-devel libxml2-devel
  
  // 一个生产环境打开了 openssl fpm 等 目前正在使用中的安装configure 配置
  ./configure --prefix=/usr/local/php --with-openssl --enable-fpm --with-zlib --enable-mbstring --with-curl --enable-soap --with-mcrypt --enable-sockets --enable-fpm --with-zlib --enable-mbstring --with-curl --enable-soap --with-mcrypt --enable-sockets --with-config-file-path=/etc --with-pdo-mysql

  // 目前使用中的(2015-8-11)
  yum -y install libmcrypt-devel curl-devel libxml2-devel
  

  // 报 libmcrypt-devel no package
  
  wget ftp://mcrypt.hellug.gr/pub/crypto/mcrypt/attic/libmcrypt/libmcrypt-2.5.7.tar.gz
  
  // 安装libmcrypt-devel
  ./configure  make make install (./configure 代参数不好用)
  
  
  // freetype
  yum -y install freetype freetype-devel
  
  
  // 安装php 16.2.19
  ./configure --prefix=/usr/local/php --with-config-file-path=/usr/local/php/etc --with-openssl --enable-fpm --with-zlib --enable-mbstring --with-curl --enable-soap --with-mcrypt --enable-sockets --with-pdo-mysql --disable-fileinfo --enable-bcmath --with-gd --with-mysql --with-mysqli=mysqlnd --with-gettext --with-freetype-dir=/usr/local/freetype --with-jpeg-dir=/usr/local/jpeg6 
  -with-ttf 参数无法识别
  
  // 安装zabbix使用
  --enable-bcmath --with-gd --with-mysql --with-mysqli=mysqlnd --with-gettext --with-freetype-dir=/usr/local/freetype --with-jpeg-dir=/usr/local/jpeg6 -with-ttf  


{% endhighlight %}


# redmine 


##### 1.安装ruby 解释器

{% highlight sh %}

wget http://cache.ruby-lang.org/pub/ruby/2.0/ruby-2.0.0-p645.tar.gz

tar -xzvf ruby-2.0.0-p645.tar.gz
cd ruby-2.0.0-p645
./configure -prefix=/usr/local/ruby
make
make install

export PATH=/usr/local/ruby/bin:$PATH

{% endhighlight %}


#####  2.安装gem

{% highlight sh %}

wget http://production.cf.rubygems.org/rubygems/rubygems-2.0.14.tgz

tar xzvf  rubygems-2.0.14.tgz
cd rubygems-2.0.14/
ruby setup.rb

{% endhighlight %}

可以更改gem源
{% highlight sh %}

gem sources -a http://ruby.taobao.org/
gem sources -r https://rubygems.org/
gem sources -l 

{% endhighlight %}

##### 3.安装rails

{% highlight sh %}

gem install rails -v=3.2.21 -V

{% endhighlight %}

##### 4.安装 bundler
 
{% highlight sh %}

gem install bundler

{% endhighlight %}

##### 5.解压 redmine 并安装缺失扩展

{% highlight sh %}

wget http://www.redmine.org/releases/redmine-2.6.5.tar.gz

mv redmine-2.6.5.tar.gz /usr/local/
cd /usr/local/
tar -zxvf redmine-2.6.5.tar.gz
mv redmine-2.6.5 redmine
cd /usr/local/redmine/config
mv database.yml.example database.yml

{% endhighlight %}

更改数据库配置 database.yml

{% highlight html %}

production:
  adapter: mysql2
  database: redmine
  host: localhost
  username: redmine
  password: my_password

{% endhighlight %}


在 /usr/local/redmine下 执行

{% highlight sh %}

bundle install --without development test rmagick

{% endhighlight %}

检查缺失的扩展,并通过提示使用gem安装

安装 gem install mysql2 时提示缺失mysql.h 引起的错误。

使用yum install mysql-devel 解决了该问题

所有依赖全部完成时提示

{% highlight html %}

Bundle complete! 26 Gemfile dependencies, 40 gems now installed.
Gems in the groups development, test and rmagick were not installed.
Use `bundle show [gemname]` to see where a bundled gem is installed.

{% endhighlight %}

##### 6.Session store secret generation

{% highlight sh %}

bundle exec rake generate_secret_token

{% endhighlight %}

##### 7.Database schema objects creation

{% highlight sh %}

RAILS_ENV=production bundle exec rake db:migrate

{% endhighlight %}

##### 8.Database default data set

{% highlight sh %}

RAILS_ENV=production bundle exec rake redmine:load_default_data

{% endhighlight %}

##### 9.File system permissions

如下位置需要写的权限

files (storage of attachments)
log (application log file production.log)
tmp and tmp/pdf (create these ones if not present, used to generate PDF documents among other things)
public/plugin_assets (assets of plugins)

{% highlight sh %}

mkdir -p tmp tmp/pdf public/plugin_assets
sudo chown -R redmine:redmine files log tmp public/plugin_assets // 我是root 起的 就没执行这条
sudo chmod -R 755 files log tmp public/plugin_assets
    
{% endhighlight %}


##### 10.启动

{% highlight sh %}

bundle exec ruby script/rails server webrick -e production

{% endhighlight %}

##### 11.参考

[官方文档](http://www.redmine.org/projects/redmine/wiki/RedmineInstall)
[开源中国社区](http://www.oschina.net/question/16_8357)


### ZABBIX

原本使用的监控方式是logstash+kibana+elasticsearch 的方式，
实际应用的时候elasticsearch 的9200 端口没有找到`外网禁用` 或者 `白名单ip` 或者 `登录验证` 的方法，造成aliyun的服务器会提示漏洞。
从现实角度，确实也不希望该服务器可以被外网访问。
解决方法可能局限在 将kibana+elasticsearch搭建在无外网的服务器上，由于aliyun对于使用者来说就是外网。该方法行不通。

目前想到思路就是，logstash只负责同步日志，监控的事情拆掉使用zabbix做监控

#### zabbix 安装笔记

准备工作
yum install mysql-devel gcc net-snmp-devel curl-devel perl-DBI php-gd php-mysql php-bcmath php-mbstring

获取包
wget "http://jaist.dl.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/2.4.6/zabbix-2.4.6.tar.gz"
wget "http://jaist.dl.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/1.8.22/zabbix-1.8.22.tar.gz"

编译安装
./configure --prefix=/usr/local/zabbix --enable-server --enable-proxy --enable-agent --with-mysql --with-net-snmp --with-libcurl
make && make install

添加端口 vim /etc/services 增加
zabbix-agent    10050/tcp                       # Zabbix Agent
zabbix-agent    10050/udp                       # Zabbix Agent
zabbix-trapper  10051/tcp                       # Zabbix Trapper
zabbix-trapper  10051/udp                       # Zabbix Trapper

配置数据库
mkdir -p /etc/zabbix
cp conf/zabbix_*.conf /etc/zabbix/

vim /etc/zabbix/zabbix_server.conf
DBName=XXXX
DBHost=XXXX
DBPort=XXXX
DBUser=XXXX
DBPassword=XXXX

建软连接
cd /usr/local/zabbix/bin/
for i in *;do ln -s /usr/local/zabbix/bin/${i} /usr/bin/${i};done
cd /usr/local/zabbix/sbin/
for i in *;do ln -s /usr/local/zabbix/sbin/${i} /usr/bin/${i};done

数据库导入数据
[root@test2 zabbix-2.4.6]# mysql -uXXX -pXXX -h XXXXXXX zabbix <database/mysql/schema.sql 
[root@test2 zabbix-2.4.6]# mysql -uXXX -pXXX -h XXXXXXX zabbix <database/mysql/images.sql 
[root@test2 zabbix-2.4.6]# mysql -uXXX -pXXX -h XXXXXXX zabbix <database/mysql/data.sql

添加启动脚本
在zabbix2.4.6包中init.d下没有看到centos或者redhat的启动脚本使用zabbix 1.8.x的启动脚本
cp misc/init.d/redhat/8.0/zabbix_server /etc/init.d/
chmod a+x /etc/init.d/zabbix_server
cp misc/init.d/redhat/8.0/zabbix_agentd /etc/init.d/
chmod a+x /etc/init.d/zabbix_agentd
 
更改启动脚本
sed -i 's/^progdir=.*$/progdir="\/usr\/local\/zabbix\/sbin\/"/g' /etc/init.d/zabbix_server
sed -i 's/^progdir=.*$/progdir="\/usr\/local\/zabbix\/sbin\/"/g' /etc/init.d/zabbix_agentd


目前遇到的问题

{% highlight html %}

server 101.200.180.127

agentd 123.57.60.47

在server上：

启动zabbix_server 成功

[root@iZ25ifl9i5nZ etc]# service zabbix_server start
Starting zabbix_server:                                    [  OK  ]
日志中提示
 31348:20150907:110935.345 using configuration file: /usr/local/zabbix/etc/zabbix_server.conf

查看 zabbix_server.conf
[root@iZ25ifl9i5nZ etc]# cat /usr/local/zabbix/etc/zabbix_server.conf|grep -v ^#|grep -v ^$
LogFile=/tmp/zabbix_server.log
DBHost=127.0.0.1
DBName=zabbix
DBUser=root
DBPassword=root
DBPort=3306

没看出来问题


启动zabbix_agentd 

在agent上
[root@dev ~]# service zabbix_agentd start
Starting zabbix_agentd:                                    [  OK  ]

提示 使用配置文件

5965:20150907:111436.722 using configuration file: /usr/local/zabbix/etc/zabbix_agentd.conf

[root@dev ~]# cat /usr/local/zabbix/etc/zabbix_agentd.conf|grep -v ^#|grep -v ^$
LogFile=/tmp/zabbix_agentd.log
Server=101.200.180.127
ListenPort=10050
StartAgents=8
Hostname=123.57.60.47
Timeout=30
Include=/usr/local/zabbix/etc/zabbix_agentd.conf.d/
UnsafeUserParameters=1



{% endhighlight  %}
