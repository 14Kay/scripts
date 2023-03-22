---
title: 用贪吃蛇的方式打开Github贡献图
date: '2023-03-21'
tags: ['GitHub', '动图']
cover: https://files.catbox.moe/i9c2rc.png
draft: false
summary: '用Github的贡献记录生成贪吃蛇动画，并展示在个人页面'
---
[![](https://ghproxy.com/https://raw.githubusercontent.com/14kk/14kk/output/github-contribution-grid-snake.svg)](https://14k.top)
## 前言

忘记在哪儿看见的这个有趣的贪吃蛇动图，然后去Github一通翻找，终于让我找到啦

## 一、创建仓库

由于需要展示在Github首页，所以我们需要建立一个同名仓库。没有的自行创建一个。

## 二、修改Workflow权限

创建好仓库后 依次点击  `Settings` -> `Actions` -> `General` 拉到最下面 找到 "Workflow permissions" 选择 `Read and write permissions`
点击保存。这一步非常重要，不设置的话Action会执行失败

## 三、添加Workflow

依次点击`Actions` -> `New Workflow`

![](https://files.catbox.moe/fvlbjz.png)

点击`Configure`

![](https://files.catbox.moe/4odk1w.png)




```yml

name: generate snake

on:
  # run automatically every 6 hours
  schedule:
    - cron: "0 */6 * * *"

  # allows to manually run the job at any time
  workflow_dispatch:

  # run on every push on the master branch
  push:
    branches:
      - master

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      # generates a snake game from a github user (<github_user_name>) contributions graph, output a svg animation at <svg_out_path>
      - name: generate github-contribution-grid-snake.svg
        uses: Platane/snk/svg-only@v2
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: dist/github-contribution-grid-snake.svg

      # push the content of <build_dir> to a branch
      # the content will be available at https://raw.githubusercontent.com/<github_user>/<repository>/<target_branch>/<file> , or as github page
      - name: push github-contribution-grid-snake.svg to the output branch
        uses: crazy-max/ghaction-github-pages@v2.5.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```
复制上面这段代码到输入框，代码部分不需要改任何地方，直接可用

![](https://files.catbox.moe/7qab0s.png)

- 点击右侧的`Start Commit` 会弹窗 再点击 `Commit New file`.

- 进入`GitHub Actions`页面,点击前面建立的工作流，点击`Run workflow`.

- 等待执行后，可以看到多了一个`output`分支，进入该分支，即可看到的生成svg。点击生成的svg进入到该svg的页面点击右上角的`raw`即可获取其实际链接
或自行使用以下格式

```url
https://raw.githubusercontent.com/账号/仓库/output/github-contribution-grid-snake.svg
```

## 如何使用

国内github速度堪忧，所以使用了`https://ghproxy.com/`代理
```
![](https://ghproxy.com/https://raw.githubusercontent.com/14kk/14kk/output/github-contribution-grid-snake.svg)
```
最后是实际效果啦
![](https://ghproxy.com/https://raw.githubusercontent.com/14kk/14kk/output/github-contribution-grid-snake.svg)