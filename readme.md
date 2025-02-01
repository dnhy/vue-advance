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

## Reflect作用
保证this指向当前操作的代理对象
```js
const obj ={}
const proto = {
    a:123
}
const protoProxy = new Proxy(proto,{
    get(t,p,r){
       return Reflect.get(t,p,r); 
    },
    set(t,p,v,r){
        console.log('parent')
        return Reflect.set(t,p,v,r)
    }
})
Object.setPrototypeOf(obj,protoProxy)
const objProxy = new Proxy(obj,{
    get(t,p,r){
       return Reflect.get(t,p,r); 
    },
    set(t,p,v,r){
        console.log('child')
        return Reflect.set(t,p,v,r)
    }
})

objProxy.a = 567
```
设置objProxy的a属性值，由于obj上无a属性，会进行原型链查找触发protoProxy的set，它的receiver指向objProxy，所以不会修改原型对象proto的a属性值,而是添加obj的a属性。即使不用代理，原生的属性也会按照这个逻辑进行修改。
如果不想要在obj原始对象上添加a属性，可以修改protoProxy的set中的receiver参数指向protoProxy本身，或者不传r默认指向当前代理对象，这样就对原型对象上的属性a进行了修改。也可以进行阻断，这样就都不会对原型对象和原始对象进行属性修改。

