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

- effect的作用
(1)创建reactiveEffect(2)调用effect.run


3. effect方法中传一个方法给reactiveEffect并在run中立即调用，访问响应式数据属性，触发getter进行track

- run的作用

    (1)将当前reactiveEffect挂到全局

    (2)调用传入的fn访问响应式数据触发依赖收集

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

- 多次执行属性修改，通过异步调用的方式只执行一次

## computed

1. 计算属性对象访问value属性收集渲染effect

2. 计算属性的value属性getter调用run获取结果值，访问内部依赖

3. 内部依赖收集计算属性effect

4. 计算属性的value属性修改调用setter就调用传入的setter方法，触发内部依赖属性变化，属性收集的计算属性effect调用schedule。schedule中手动触发triggerEffects，调用渲染effect访问value值，重新计算新值

5. 使用dirty标识符确定每部依赖是否发生变化，如果为false，直接返回之前计算的值，如果为true，计算之后再返回新的值，并设置为false。
当依赖发生变化时，设置为true，下次访问value时get内部重新进行计算新值


## watch
默认监听响应式对象第一层的属性（浅层监听,第一层属性进行依赖收集），**如果设置了深层监听，就是对当前监听的对象进行了递归遍历**，这样性能较差。所有监听对象其实都转换成了一个getter函数，调用之后访问响应式数据属性进行依赖收集，收集的是一个新创建的effect，将cb作为sheduler。

**所以看能不能监听本质上看这个属性有没有进行依赖收集**

1. 将监听对象转换成一个getter函数，如果原先是函数不用变，如果原先是响应式对象，修改成一个函数，函数调用后进行对象的遍历并返回原对象。

2. 如果有deep:true,需要getter函数返回的监听对象中的响应式对象或属性进行遍历。

3. 创建一个effect，传入getter，调用effect.run访问响应式数据属性，进行依赖收集并获取oldvalue。

4. 当属性值发生变化，调用schedule即job，job中调用effect.run获取newValue，调用cb并将oldValue和newValue传入

5. 如果有immediate:true,第三步改调用job，获取newValue并进行依赖收集，此时oldValue为undefined。立刻调用一次cb，传入oldValue和newValue。值发生变化时同第四步