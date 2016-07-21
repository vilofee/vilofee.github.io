---
layout: post
title: "关于Yac的使用问题"
date: 2016-07-20 11:41:31
published: true
categories: coding-java
---

#### 提纲

* 目录
{:toc}
<br/>
------

### 站在前人的肩膀上

先写第一句话,感谢Yac的作者鸟哥.Yac的使用最早还是在14年下半年业务架构升级的时候考虑加入到当时的代码中的.
自己也稍微走了点认识上的弯路.

先贴几个链接吧

[风雪之隅关于Yac机制的介绍](http://www.laruence.com/2013/03/18/2846.html)

[github源码地址](https://github.com/laruence/yac)

------

### 一些总结

Yac 是一个同族进程间(典型的如PHP-FPM及其子进程)共享数据的无锁的缓存,无锁的目的是提高CPU多进程的效率.

而解决无锁的数据一致性问题主要靠两个方面

1. 读锁的替代方案: 返回数据前的校验机制(CRC校验)
2. 写锁的替代方案: 启动时就确定key空间的分布,写操作将数据哈希到对应的slot,对同一个slot写操作冲突问题,客观上允许这种操作的存在,但主观上忽略之(鸟哥自己的测试脚本([脚本地址](https://github.com/laruence/yac/blob/master/tests/yac_conflict.php))结果是千万分之一).

------

### 性能对比

鸟哥的blog叙述比较详细了,就不多说了, 跟APC比整体上要快,数据的吞吐量稍低.

------

### 填坑

* PHP5 和PHP7 的分支不一样,使用的时候需要注意
* php.ini 中设置 yac.enable_cli = 1
* 自增操作因为无锁不能保证原子性,所以估计不会考虑增加
* 在之前应用的过程中,因为不做缓存主动更新的机制,主要依赖过期行为(1-2min),造成后端数据的更新需要2min后到达前端.
* 重点提一下,其解决的是同族进程间数据共享的问题.

------

### 典型用法demo代码

* 基于Yii框架

{% highlight php %}
<?php
    /**
     * 来自yac缓存
     * @param $model MajorCActiveRecord(CActiveRecord的子类) Yii对应的model
     * @param $ids $ids 需要对象的id列表
     * @param bool $return_map 结构是否返回map/list
     * @param bool $sorted 结果是否排序，只在返回list下有效
     * @return array|bool
     */
    function fetchInYac($model, $ids, $return_map = false, $sorted = false)
    {
        $return_single = false;
        if (!$model instanceof MajorCActiveRecord) {
            return false;
        }

        if (empty($ids)) {
            return false;
        }

        if (!is_array($ids)) {
            $ids = array($ids);
            $return_single = true;
        }

        $yac_objects = array();
        $unfind_ids = $ids;
        $yac = false;
        if (Config::enable_Yac) {
            $yac = new Yac($model->tableName());
            $yac_objects = array_filter($yac->get($ids));
            $finded_ids = array_keys($yac_objects);
            Logger::d("[YAC] yac objects -> " . print_r($yac_objects, true));
            $unfind_ids = array_diff($ids, $finded_ids);
            Logger::d("[YAC] yac miss ids -> " . print_r($unfind_ids, true));
        }
        $db_objects = $model->getObjectByIds($unfind_ids, false, true);
        Logger::d("[YAC] db objects -> " . print_r($db_objects, true));
        if($yac) {
            $yac->set($db_objects, 86400);
        }
        if(!$yac_objects) {
            $yac_objects = array();
        }
        if(!$db_objects) {
            $db_objects = array();
        }
        $all_objects = $yac_objects + $db_objects;

        if($return_single) {
            return !empty($all_objects[0])? $all_objects[0]:array();
        }

        if ($return_map) {
            return $all_objects;
        } else {
            if ($sorted) {
                $sorted_objects = array();
                foreach ($ids as $_id) {
                    $sorted_objects[] = !empty($all_objects[$_id]) ? $all_objects[$_id] : array();
                }
                return $sorted_objects;
            } else {
                return array_values($all_objects);
            }
        }
    }
{% endhighlight%}

### 应用上的局限

* 最主要还是主动更新同步的代价问题

    在运行PHP-FPM的机器很多的情况下,当原始数据发生了更新操作,
    如果要求实时性较高,就需要主动更新所有的机器中的Yac的缓存,
    这个对于更新操作来说开销感觉很大,不建议这么做,所以从应用角度来看比较适合数据实时性要求不高的系统,
    等待Yac数据的自动过期重新获取,以达到缓存更新的目的.




