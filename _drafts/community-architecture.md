---
layout: post
title:  "社区系统的架构设计方案"
date:   2016-3-9 12:05:57
published: false
categories: feel
---

# 社区系统的架构设计

## 用户关系的建立.

### 假设需要满足的基本需求

1. 满足用户之间添加/删除的关注的行为.
2. 当两个人互相关注后标识两个人互为好友.互为好友的两个人,其中一个取消对另一个的关注,标识为不是互为好友.
3. 支持验证a是否关注了b,a,b是否互相关注.
4. 支持获取a的关注的人列表,支持获取a的粉丝列表,支持获取a的好友列表.

### 表结构设计

#### user_relation_major ——主表

##### 示例

<table class="table table-striped">
  <tr class="active">
    <th>user_id</th>
    <th>follow_user_id</th>
    <th>is_tow</th>
  </tr>
  <tr class="warning">
    <th>10000001</th>
    <th>10000002</th>
    <th>1</th>
  </tr>
  <tr class="warning">
    <th>10000002</th>
    <th>10000001</th>
    <th>1</th>
  </tr>
  <tr class="warning">
    <th>10000001</th>
    <th>10000003</th>
    <th>0</th>
  </tr>
</table>

##### 说明

* 字段说明:A关注B, user_id为 A, follow_user_id 为B, is_tow表示是否互相关注.
* 分表,以user_id为分表维度,可以拆分为 user_relation_major_1,user_relation_major_2,user_relation_major_3,......;在user_id为自增系统中可以使用`user_id%分表个数` 的方式获取表索引.
* 索引建立(user_id, follow_user_id) 和(user_id, is_tow).
* 支持操作
** 满足用户之间添加/删除的关注的行为
** 当两个人互相关注后标识两个人互为好友.互为好友的两个人,其中一个取消对另一个的关注,标识为不是互为好友.
** 支持验证a是否关注了b,a和b是否互相关注.
** 支持获取a的关注的人列表
** 支持获取a的好友列表

#### user_relation_minor —— 冗余副表

##### 示例

<table class="table table-striped">
  <tr class="active">
    <th>follow_user_id</th>
    <th>user_id</th>
  </tr>
  <tr class="warning">
    <th>10000001</th>
    <th>10000002</th>
  </tr>
  <tr class="warning">
    <th>10000002</th>
    <th>10000001</th>
  </tr>
  <tr class="warning">
    <th>10000003</th>
    <th>10000001</th>
  </tr>
</table>

##### 说明

* 字段说明:A关注B, user_id为 A, follow_user_id 为B.
* 分表,以follow_user_id为分表维度,可以拆分为 user_relation_minor_1,user_relation_minor_2,user_relation_minor_3,......;在follow_user_id为自增系统中可以使用`follow_user_id%分表个数` 的方式获取表索引.
* 索引建立 follow_user_id.
* 支持操作
** 支持获取a的粉丝列表


