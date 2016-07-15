---
layout: post
title:  "nginx 和php-fpm 的配置"
date:   2015-05-26 11:05:35
published: false
categories: server
---


# nginx.conf

{% highlight sh %}


# 使用的用户和组
# user  nobody;

# 指定工作衍生进程数，一般等于CPU总核数或者总核数的两倍
worker_processes	8;

# 指定错误日志存放的路径
error_log	/data/logs/nginx/error/log warn;
# error_log  logs/error.log  info;
# error_log /dev/null;

# 指定文件描述符路径
pid        logs/nginx.pid;

# 指定最大文件打开数量
worker_rlimit_nofile	102400;

events {
	# 使用的网络I/O模型，Linux推荐使用epoll模型；FreeBSD推荐使用kqueue模型
	use	epoll;

	# 允许的连接数
	worker_connections	30720;
}


http {
   #real_ip_header X-Forwarded-For;
   #set_real_ip_from 192.168.0.0/16;
   #set_real_ip_from 127.0.0.1;

   ## Block spammers and other unwanted visitors  ##
   # include forbid-ips.conf;

	include	mime.types;
	default_type	application/octet-stream;

	# nginx缓冲设置
	server_names_hash_bucket_size	128;
	client_header_buffer_size	128k;
	large_client_header_buffers	8	128k;

	# 允许最大上传单个文件大小
	client_max_body_size	200m;

	# 先保存到本地，再传给用户
	client_body_buffer_size	128k;

	# 跟后端服务器连接的超时时间_发起握手等候响应时间
	proxy_connect_timeout	5s;

	# 连接成功后_等候后端服务器的响应时间_其实已经进入后端的排队之中进行等候
	proxy_read_timeout	5s;

	# 后端服务器数据回传时间_就是在规定时间内，后端数据必须全部完成传输
	proxy_send_timeout	5s;

	# 代理请求缓存区_这个缓存区会保存用户的头信息以供Nginx进行规则处理_一般只要能保存夏头信息即可
	proxy_buffer_size	128k;

	# 同上，告诉Nginx保存单个用户的几个Buffer最大用多大空间
	proxy_buffers	256	16k;

	# 如果系统很忙的时候可以申请更大的proxy_buffers，官方推荐*2
	proxy_busy_buffers_size	128k;


	log_format      main    '$remote_addr\t$remote_user\t$time_local\t$request\t$status\t$body_bytes_sent\t$http_referer\t$http_user_agent\t$content_length\t$request_time\t$upstream_response_time\t$sent_http_content_type\t$sent_http_content_encoding\t$http_m\t$request_body\t$upstream_addr\t$http_x_forwarded_for';

	access_log	/data/logs/nginx/access/log	main;

	sendfile       on;
	tcp_nopush     off;
	tcp_nodelay	  off;

	#keepalive_timeout	0;
	keepalive_timeout	65;

	#fastcgi配置
	fastcgi_connect_timeout 10s;
	fastcgi_send_timeout 10s;
	fastcgi_read_timeout 10s;
	fastcgi_buffer_size 128k;
	fastcgi_buffers 256 16k;
	fastcgi_busy_buffers_size 256k;
	fastcgi_temp_file_write_size 256k;
    fastcgi_intercept_errors on;

	# gzip压缩设置
	gzip  off;
	gzip_min_length		1k;
	gzip_buffers		4 16k;
	gzip_comp_level		8;
	gzip_http_version	1.1;
	gzip_types              text/json application/json text/plain application/xhtml+xml text/xml application/xml application/xml+rss application/x-m3u8;
	gzip_vary		on;

	# nginx proxy 缓存设置
	# proxy_temp_path和proxy_cache_path指定的路径，必须在同一分区
	proxy_temp_path	/data/nginx_cache/proxy_temp_path;
	# 设置web缓存区名称为cache_one，内存缓存空间大小为500m，
	# 自动清除超过1天没有被访问的数据，硬盘缓存空间大小为30g
	proxy_cache_path /data/nginx_cache/proxy_cache_path levels=1:2 keys_zone=cache_one:200m inactive=1d max_size=30g;

	# 后端承担负载的服务器
	upstream static_server{
 		server 10.153.74.70:80;
 	}

    upstream fastcgi{
        server 10.153.74.20:9000;

    }


    limit_req_zone  $binary_remote_addr  zone=php:50m   rate=20r/s;
    ##deny tencent hack server
    deny 203.195.147.0/24;
    deny 203.195.180.0/24;
    deny 203.195.185.0/24;
    deny 203.195.201.0/24;
   
    deny 221.0.121.45;
    limit_req_log_level notice;
	server {
		listen	80;
		#server_name	iface.qiyi.com,"";	
        server_tokens off;

		# 全部使用utf-8编码
		charset	utf-8;

		root /data;

     location /nginx_status {
		 stub_status on;
		 access_log   off;
		 #allow 10.1.3.147;
		  allow   10.0.0.0/8;
          deny all;
	 }

		location /php_status {

        		allow   10.0.0.0/8;
        		deny all;

                chunked_transfer_encoding off;
                fastcgi_index  index.php;
                # specify the listening address and port
                fastcgi_pass fastcgi;
                # the document path to be passed to PHP-FPM
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                # the script filename to be passed to PHP-FPM
                fastcgi_param PATH_INFO $fastcgi_script_name;
                # include other FastCGI related configuration settings
                include fastcgi_params;
                #fastcgi_param  REMOTE_ADDR        $http_x_forwarded_for;

        }

		# 对扩展名为gif、jpeg的图片进行缓存
		# location ~ .*\.(js|png|jpg|JPG|jpeg|JPEG|css|bmp|gif|GIF)$ {
# 			# 使用web缓存cache_one
# 			proxy_cache cache_one;
# 
# 			# 对不同的HTTP状态码设置不同的缓存时间
# 			proxy_cache_valid 200 304 12h;
# 			proxy_cache_valid 301 302 1m;
# 			proxy_cache_valid any 1m;
# 
# 			# 设置web缓存的key值，Nginx根据key值md5哈希存储缓存，这里根据“域名、URI、参数”组合成key
# 			proxy_cache_key $host$uri$is_args$args;
# 
# 			# 反响代理设置
#        		proxy_pass          http://backend_servers;
# 			proxy_redirect      default;
# 			proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
# 			proxy_set_header    X-Real-IP $remote_addr;
# 			proxy_set_header    Host $http_host;
# 			proxy_set_header	Range $http_range;
# 
# 			# 如果后端的服务器返回502、504、执行超时等错误，
# 			# 自动将请求转发到upstream负载均衡池中的另一台服务器
# 			# ，实现故障转移
# 			 proxy_next_upstream http_502 http_504 error timeout invalid_header;
# 		}

        rewrite "^/views/([0-9]+\.[0-9]+)/([a-z_-]+)(\?.+)?$"  /php/views/api/$1/$2.php$3  last;
		location /php/ {  # for requests ending with .php
            fastcgi_next_upstream error timeout http_500;
            limit_req   zone=php  burst=5 nodelay;
            chunked_transfer_encoding off;
			fastcgi_index  index.php;
			# specify the listening address and port
			fastcgi_pass fastcgi;
			# the document path to be passed to PHP-FPM
			fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
			# the script filename to be passed to PHP-FPM
			fastcgi_param PATH_INFO $fastcgi_script_name;
			# include other FastCGI related configuration settings
			include fastcgi_params;
			#fastcgi_param  REMOTE_ADDR        $http_x_forwarded_for;
			
			
         }

#          location /jsp/ {
# 
# 	                proxy_pass          http://backend_servers;
#                         proxy_redirect      default;
#                         proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
#                         proxy_set_header    X-Real-IP $remote_addr;
#                         proxy_set_header    Host $http_host;
#                         proxy_set_header        Range $http_range;	 
#          }
          location /st/ {
                proxy_pass   http://static_server;
                default_type "application/json";
                charset utf-8;
                add_header "Content-Type" "application/json; charset=utf-8";

                gzip  on;
                gzip_min_length         1k;
                gzip_buffers            4 16k;
                gzip_comp_level         8;
                gzip_http_version       1.1;
                gzip_types              text/json application/json text/plain application/xhtml+xml text/xml application/xml application/xml+rss application/x-m3u8;
                gzip_vary               on;
          } 
         location / {
             deny all;
         }

	}
}


{% endhighlight %}
