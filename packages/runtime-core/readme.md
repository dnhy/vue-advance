## createVNode
创建一个vnode，确定vnode的shapeFlag,当前虚拟节点的类型。shapeFlag由当前节点类型和子元素类型共同决定。

## h方法
根据参数数量进行重载，调用createVNode

## createRender
传入浏览器的options，包含处理dom的方法，返回一个render方法

## render
如果是第一次渲染，挂载vnode到节点上