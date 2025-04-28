## 开始创建一个仓库
1. 配置身份 

```bash
$ git config --global user.name "Tony"
$ git config --global user.email "Tony@gmail.com"
```


2. 创建本地仓库
   用bash打开本地文件夹

```bash
$ git init
```
此时会生产一个.git的文件
![[Pasted image 20250428085022.png]]
3. 提交代码到本地仓库

```bash
$ git add .
```
这是把所有文件都推进缓存

也可以把名为app的文件夹推进缓存

```bash
$ git add app
```

4. 把代码提交到本地仓库

```bash
$ git commit -m "First Commit"
```
一定要有commit的注释，否则无法提交

5. 在Github配置ssh密钥创建仓库

6. 关联本地仓库与Github的远程仓库 

```bash
$ git remote add origin "git@github.com:ColdNormal/ob-noteBook.git"
```
7. 把本地仓库的代码推送到GIthub远程仓库

```bash
$ git push -u origin master
```





