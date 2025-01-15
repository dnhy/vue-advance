## 打包方式
- esm-bundler
模块不打包到一起.使用ESModule相互引用

- esm-browser
模块打包到一起

- global
vue.xxx
立即执行函数

- commonjs
node相关、服务端渲染

## node使用esmodule
node环境下可以使用esModule，通过配置package.json的type:module。配置之后在文件中不能使用__dirname、__filename。

## 响应式数据原理
1. reactive代理对象，添加getter、setter成为响应式数据

- 处理嵌套代理

- 处理多次代理

2. 调用effect方法，创建一个reactiveEffect并放在全局activeEffect上

- 处理组件effect嵌套导致的activeEffect使用问题

3. effect方法中传一个方法给reactiveEffect并立即调用，访问响应式数据属性，触发getter进行track

4. track依赖收集：使用map关联原始对象target=>dep{key=>set[effect、effect]},set中添加effect时，该effect反向关联dep。使得属性和effect是n:n的关系。

- 一个属性在effect中多次使用防止重复收集

5. 当响应式数据发生修改事，触发setter进行tigger

- 如果值未改变，则不执行trigger

5. trigger触发更新:找到当前属性的effect数组依次执行run更新dom

- 执行时会把当前effect挂到全局activeEffect上

- 当effect执行时发现传入的函数中有对当前属性的更改，会进入死循环。需要比较当前effect和全局的activeEffect是否相同
 
 ```javascript
    effect(() => {
        foo.age = Math.random();

        root.innerHTML = foo.age;
    });
 ```
- 每次执行run都应该清空属性收集的依赖，并重新收集。因为执行run之后部分属性可能不需要收集依赖，对其修改不应该触发effect

```javascript
    effect(() => {
    // foo.age = Math.random();
    // root.innerHTML = foo.age;

        console.log("触发");
        root.innerHTML = foo.flag ? foo.name : foo.age;
    });

    setTimeout(() => {
        foo.flag = false;
        setTimeout(() => {
            foo.name = "jerry";
        }, 1000);
    }, 1000);
```