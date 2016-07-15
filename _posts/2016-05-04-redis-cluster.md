---
layout: post
title: "Redis 集群化方案"
date: 2016-05-04 12:00:56
published: true
categories: opensource
---

## Redis集群化的必要性

由于redis本身是内存型的存储介质, 
注定了redis要受内存大小的限制. 
在大数据背景下,数据大小很容易就会突破redis内存的限制.集群化的redis可以更好的为大数据服务.

## 集群化过程中必须注意的要点.

这个其实跟大部分存储介质所面对的问题是一样的.

* 数据分片及一致性算法问题.
* 单点故障下的灾备问题.

## 一些开源的项目

* redis-cluster

    今天看到redis.cn官网已经把redis.io的关于redis-cluster的内容翻译过来了,就索性来看看其文档的一些实现.一下是看的过程中提炼的一些笔记.
      
    * redis集群的目标
        * 1000个节点表现正常
        * 不考虑关于key的合并操作
        * 写入安全(safe writing)
        * 高可用(availability)
    * 实现的操作是单机redis的子集
        * 不支持多键值的复杂操作
        * 只有db0,不支持select
    * 集群协议
        * 节点之间通过TCP连接,并使用二进制协议建立通信
        * gossip协议来传播集群信息:发现新节点, 发送ping包,特定情况发生时发送集群消息,处理集群上的发布或者订阅消息
        * 不代理请求,客户端收到重定向错误后,自己做重定向.
        * 如果客户端建立缓存key和节点之间的映射关系,可以明显提高执行效率
    * 安全写入
        * Redis 集群会努力尝试保存所有与大多数主节点连接的客户端执行的写入,(异步冗余备份到从节点)
        * 有两种例外情况
            * 写入到达节点的主节点, 主节点返回写入成功, 异步冗余备份到从节点时,主节点宕机, 该写入就丢失了.
            * 分区使主节点不可达,failover到主节点的一个从节点(即从升主),过了一段时间主节点变成可达,
            对于没有路由更新的节点可能会把主节点依旧认为是从节点(极小概率事件)
    * 可用性 
    * 键分布模型
        * HASH_SLOT = crc16(key) mod 16384
    * 键哈希标签
        * 只考虑第一个匹配到的内容非空的"{","}"中间的结果
    * 集群节点属性
        * 节点共享信息:(使用 cluster nodes命令获取如下信息)
            * 各个节点的ip端口
            * 各个节点的哈希槽
            * 如果是主节点,该节点的从节点个数
            * 如果是从节点,主节点ID信息
            * 各种标识
            * 最近一次用集群连接发送ping包的时间
            * 最近一次在回复中收到pong包的时间
            * 最近一次标识节点失效的时间
    * 集群拓扑结构
        网状结构,N个节点的集群中,每个节点都有N-1个流出连接和N-1个流入的连接,并且都是TCP长连接
    * MOVED重定向
        如果查询key的哈希槽在当前节点,将数据返回客户端
        如果不在, 返回MOVED重定向,会把哈希槽和节点映射给到客户端,客户端需要发起第二次请求获取数据
        
        GET x 
        -MOVED 3999 127.0.0.1:6381
    
    * 集群的在线重配置
        * 节点的添加或者删除本质上都是哈希槽归属的节点的移动过程
        * 数据一致性的保证基于MIGRATING 和IMPORTING两个状态
            * 当一个哈希槽被设置为MIGRATING时,原来持有该槽的节点,只有在查询的键还存在于原节点时,会处理请求,否则返回客户端一个-ASK的重定向
            * 当一个哈希槽被设置为IMPORTING时,只有接收到ASKING命令时才会处理请求.如果客户端一直没发ASKING,那么查询就会被-MOVED重定向.
        * MIGRATING 和IMPORTING示例:
            把槽8从节点A移动到节点B
            * 我们向 节点B 发送：CLUSTER SETSLOT 8 IMPORTING A
            * 我们向 节点A 发送：CLUSTER SETSLOT 8 MIGRATING B
            其他节点在被询问到一个键是属于哈希槽 8 的时候，都会把客户端引向节点”A”。具体如下：
            * 所有关于已存在的键的查询都由节点”A”处理。
            * 所有关于不存在于节点 A 的键都由节点”B”处理。
        * ASK重定向
            这个命令是必要的，因为下一个关于哈希槽 8 的查询需要的键或许还在节点 A 中，所以我们希望客户端尝试在节点 A 中查找，
            如果需要的话也在节点 B 中查找。 
            由于这是发生在 16384 个槽的其中一个槽，所以对于集群的性能影响是在可接受的范围。
            一旦完成了哈希槽 8 的转移，节点 A 会发送一个 MOVED 消息，客户端也许会永久地把哈希槽 8 映射到新的 ip:端口号 上。 
    * 节点失效检测
        * FAIL:所有节点都认为该节点失效; PFAIL:当前节点认为某个节点失效
        * 当下面的条件满足的时候，会使用这个机制来让 PFAIL 状态升级为 FAIL 状态：
            * 某个节点，我们称为节点 A，标记另一个节点 B 为 PFAIL。
            * 节点 A 通过 gossip 字段收集到集群中大部分主节点标识的节点 B 的状态信息。
            * 大部分主节点标记节点 B 为 PFAIL 状态，或者在 NODE_TIMEOUT * FAIL_REPORT_VALIDITY_MULT 这个时间内是处于 PFAIL 状态。
        * 如果以上所有条件都满足了，那么节点 A 会：
            * 标记节点 B 为 FAIL。
            * 向所有可达节点发送一个 FAIL 消息。
        * 清除 FAIL 标识只有以下两种可能方法：
            * 节点已经恢复可达的，并且它是一个从节点。在这种情况下，FAIL 标识可以清除掉，因为从节点并没有被故障转移。
            * 节点已经恢复可达的，而且它是一个主节点，但经过了很长时间（N * NODE_TIMEOUT）后也没有检测到任何从节点被提升了。
    * 集群阶段
    * 配置阶段
    * 从节点的选举和提升
    * 主节点回复从节点的投票请求
    * 从节点选举的竞争情况
    * 服务器哈希槽的信息传播规则
    * update消息
    * 备份迁移
    * 备份迁移算法

    

* twemproxy

    [github项目地址](https://github.com/twitter/twemproxy)
    
    twitter开发的一个redis或者memcache的一致性通信协议封装.
    可以将 host-port-a, host-port-b, host-port-c 三台redis 在固定的一致性协议框架下,映射到 host-port-d单台服务器中,对host-port-d的读写操作会按照特定的协议定向到
    host-port-a, host-port-b, host-port-c 中的某一台.
    在认为host-port-d负载过高的情况下,可以使用另一台host-port-e与host-port-d一起做负载均衡.
    其拓扑结构是典型的代理的结构
    
    **另外有用户压测过twemproxy会造成redis 的qps约20%的下降.**''
    
    一个twemproxy的简单配置(/usr/local/twemproxy/sbin/conf/nutcracker.yml) :
    
    > 将6379,6380 两个端口的redis实例按照crc32a 作为一致性校验方法, 通过22121端口搭建成一个集群
    
    {% highlight ruby%}
    alpha:
      listen: 127.0.0.1:22121
      hash: crc32a
      distribution: ketama
      auto_eject_hosts: true
      redis: true
      server_retry_timeout: 2000
      server_failure_limit: 1
      servers:
       - 127.0.0.1:6379:1   
       - 127.0.0.1:6380:1
       
    {% endhighlight %}
    
* redis Sentinel 系统

    [官网介绍](http://redis.cn/topics/sentinel.html)
    
    redis官网有介绍的一个搭建高可用redis系统的监控工具.
    在启动redis-server进程后,使用多个redis-sentinel进程监控每个redis组的master服务器,
    当多个redis-sentinel进程判定某个master服务器客观下线时, 会将其一个slave升级为master,实现自动的灾备切换.
    
## 一个redis集群系统的架构设计图

![redis 集群化架构设计图](https://raw.githubusercontent.com/AlvinZhang86/image_web/master/redis-cluster/redis-cluster-arch.jpg)

## 一些说明

* 该实例图给出了一个 9个redis服务器,分为3组(group), 每组3台的例子,组内3台1master, 2slave, 一致性哈希算法可以使用twemproxy ,
但应当手动实现sentinel发现一台redis宕机后启动灾备后,twemproxy的动态更新.
个人有项目[distri-redis-client](https://github.com/AlvinZhang86/distributed-redis-client)也在应用层实现了redis的crc32一致性哈希算法.
* 该示例秉承读写分离原则按照`master-仅写-slave-仅读`的方案架构,实际应用中如果master负载不高的情况下可以配置为`master-读写-slave-仅读`的形式.


