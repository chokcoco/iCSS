# iCSS -- intresting css

本系列谈谈一些有趣的 `CSS` 题目，题目类型天马行空，想到什么说什么，不仅为了拓宽一下解决问题的思路，更涉及一些容易忽视的 CSS 细节。

有空就会更新，觉得不错的可以点个 `star` 收藏。

[题目 1 ~ 5](https://github.com/chokcoco/iCSS/issues/1)

[题目 6 ~ 10](https://github.com/chokcoco/iCSS/issues/2)

## 题目列表

#### 1、下面这个左边竖条图形，只使用一个标签，可以有多少种实现方式：

![border](http://images.cnblogs.com/cnblogs_com/coco1s/881614/o_border.png)

#### 2、类似下面这样的条纹边框，只使用一个标签，可以有多少种实现方式 -- 从条纹边框的实现谈盒子模型：

![backgroundClip](http://images.cnblogs.com/cnblogs_com/coco1s/881614/o_backgroundClip.png)

#### 3、层叠顺序（stacking level）与堆栈上下文（stacking context）知多少？

#### 4、从倒影说起，谈谈 CSS 继承 inherit

#### 5、纯 CSS 实现单行居中显示文字，多行居左显示，最多两行超过用省略号结尾

![多行文字展示](http://images.cnblogs.com/cnblogs_com/coco1s/881614/o_center.png)

#### 6、全兼容的多列均匀布局问题

如何实现下列这种多列均匀布局：

![多列均匀布局](http://images2015.cnblogs.com/blog/608782/201607/608782-20160713180644092-236763328.png)

#### 7、全兼容的最后一条边界线问题

看看下图，常见于一些导航栏中，要求每行中最后一列的右边框消失，如何在所有浏览器中最便捷最优雅的实现？

![消失的边界线](http://images.cnblogs.com/cnblogs_com/coco1s/881614/o_disappear.png)

#### 8、纯CSS的导航栏Tab切换方案

不用 `Javascript`，使用纯 `CSS` 方案，实现类似下图的导航栏 Tab 切换：

![纯CSS的导航栏切换方案](http://images2015.cnblogs.com/blog/608782/201610/608782-20161013103036328-1395095905.gif)

#### 9、巧妙的多列等高布局

规定下面的布局，实现多列等高布局。

``` HTML
<div id="container">
    <div class="left">多列等高布局左</div> 
    <div class="right">多列等高布局右</div>
</div>
```

多列等高布局，算是比较常见的一种布局，要求两列布局看上去高度一致（**就是通常是两列背景色一致**）。

如果只是两列背景颜色高度一致，有很多方法可以实现。

