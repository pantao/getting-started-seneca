[Seneca](http://senecajs.org/) 是一个能让您快速构建基于消息的微服务系统的工具集，你不需要知道各种服务本身被部署在何处，不需要知道具体有多少服务存在，也不需要知道他们具体做什么，任何你业务逻辑之外的服务（如数据库、缓存或者第三方集成等）都被隐藏在微服务之后。

这种解耦使您的系统易于连续构建与更新，Seneca 能做到这些，原因在于它的三大核心功能：

1. **模式匹配**：不同于脆弱的服务发现，模式匹配旨在告诉这个世界你真正关心的消息是什么；
2. **无依赖传输**：你可以以多种方式在服务之间发送消息，所有这些都隐藏至你的业务逻辑之后；
3. **组件化**：功能被表示为一组可以一起组成微服务的插件。

在 Seneca 中，消息就是一个可以有任何你喜欢的内部结构的 `JSON` 对象，它们可以通过 HTTP/HTTPS、TCP、消息队列、发布/订阅服务或者任何能传输数据的方式进行传输，而对于作为消息生产者的你来讲，你只需要将消息发送出去即可，完全不需要关心哪些服务来接收它们。

然后，你又想告诉这个世界，你想要接收一些消息，这也很简单，你只需在 Seneca 中作一点匹配模式配置即可，匹配模式也很简单，只是一个键值对的列表，这些键值对被用于匹配 `JSON` 消息的极组属性。

在本文接下来的内容中，我们将一同基于 Seneca 构建一些微服务。

## 模式（ *Patterns* ）

让我们从一点特别简单的代码开始，我们将创建两个微服务，一个会进行数学计算，另一个去调用它：

```javascript
const seneca = require('seneca')();

seneca.add('role:math, cmd:sum', (msg, reply) => {
  reply(null, { answer: ( msg.left + msg.right )})
});

seneca.act({
  role: 'math',
  cmd: 'sum',
  left: 1,
  right: 2
}, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});
```

将上面的代码，保存至一个 `js` 文件中，然后执行它，你可能会在 `console` 中看到类似下面这样的消息：

```bash
{"kind":"notice","notice":"hello seneca 4y8daxnikuxp/1483577040151/58922/3.2.2/-","level":"info","when":1483577040175}
(node:58922) DeprecationWarning: 'root' is deprecated, use 'global'
{ answer: 3 }
```

到目前为止，所有这一切都发生在同一个进程中，没有网络流量产生，进程内的函数调用也是基于消息传输。

`seneca.add` 方法，添加了一个新的动作模式（*Action Pattern*）至 `Seneca` 实例中，它有两个参数：

1. `pattern` ：用于匹配 Seneca 实例中 `JSON` 消息体的模式；
2. `action` ：当模式被匹配时执行的操作

`seneca.act` 方法同样有两个参数：

1. `msg` ：作为纯对象提供的待匹配的入站消息；
2. `respond` ：用于接收并处理响应信息的回调函数。

让我们再把所有代码重新过一次：

```javascript
seneca.add('role:math, cmd:sum', (msg, reply) => {
  reply(null, { answer: ( msg.left + msg.right )})
});
```

在上面的代码中的 `Action` 函数，计算了匹配到的消息体中两个属性 `left` 与 `right` 的值的和，并不是所有的消息都会被创建一个响应，但是在绝大多数情况下，是需要有响应的， Seneca 提供了用于响应消息的回调函数。

在匹配模式中， `role:math, cmd:sum` 匹配到了下面这个消息体：

```javascript
{
  role: 'math',
  cmd: 'sum',
  left: 1,
  right: 2
}
```

并得到计自结果：

```javascript
{
  answer: 3
}
```

关于 `role` 与 `cmd` 这两个属性，它们没有什么特别的，只是恰好被你用于匹配模式而已。

接着，`seneca.act` 方法，发送了一条消息，它有两个参数：

1. `msg` ：发送的消息主体
2. `response_callback` ：如果该消息有任何响应，该回调函数都会被执行。

响应的回调函数可接收两个参数： `error` 与 `result` ，如果有任何错误发生（比如，发送出去的消息未被任何模式匹配），则第一个参数将是一个 `Error` 对象，而如果程序按照我们所预期的方向执行了的话，那么，第二个参数将接收到响应结果，在我们的示例中，我们只是简单的将接收到的响应结果打印至了 `console` 而已。

```javascript
seneca.act({
  role: 'math',
  cmd: 'sum',
  left: 1,
  right: 2
}, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});
```

[sum.js](https://github.com/pantao/getting-started-seneca/blob/master/sum.js)  示例文件，向你展示了如何定义并创建一个 Action 以及如何呼起一个 Action，但它们都发生在一个进程中，接下来，我们很快就会展示如何拆分成不同的代码和多个进程。

## 匹配模式如何工作？

模式——而不是网络地址或者会话，让你可以更加容易的扩展或增强您的系统，这样做，让添加新的微服务变得更简单。

现在让我们给系统再添加一个新的功能——计算两个数字的乘积。

我们想要发送的消息看起来像下面这样的：

```javascript
{
  role: 'math',
  cmd: 'product',
  left: 3,
  right: 4
}
```

而后获得的结果看起来像下面这样的：

```javascript
{
  answer: 12
}
```

知道怎么做了吧？你可以像 `role: math, cmd: sum` 模式这样，创建一个 `role: math, cmd: product` 操作：

```javascript
seneca.add('role:math, cmd:product', (msg, reply) => {
  reply(null, { answer: ( msg.left * msg.right )})
});
```

然后，调用该操作：

```javascript
seneca.act({
  role: 'math',
  cmd: 'product',
  left: 3,
  right: 4
}, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});
```

运行 [product.js](https://github.com/pantao/getting-started-seneca/blob/master/product.js) ，你将得到你想要的结果。

将这两个方法放在一起，代码像是下面这样的：

```javascript
const seneca = require('seneca')();

seneca.add('role:math, cmd:sum', (msg, reply) => {
  reply(null, { answer: ( msg.left + msg.right )})
});

seneca.add('role:math, cmd:product', (msg, reply) => {
  reply(null, { answer: ( msg.left * msg.right )})
});

seneca.act({role: 'math', cmd: 'sum', left: 1, right: 2}, console.log)
      .act({role: 'math', cmd: 'product', left: 3, right: 4}, console.log)
```

运行 [sum-product.js](https://github.com/pantao/getting-started-seneca/blob/master/sum-product.js) 后，你将得到下面这样的结果：

```bash
null { answer: 3 }
null { answer: 12 }
```

在上面合并到一起的代码中，我们发现， `seneca.act` 是可以进行链式调用的，`Seneca` 提供了一个链式API，调式调用是顺序执行的，但是不是串行，所以，返回的结果的顺序可能与调用顺序并不一样。

## 扩展模式以增加新功能

模式让你可以更加容易的扩展程序的功能，与 `if...else...` 语法不同的是，你可以通过增加更多的匹配模式以达到同样的功能。

下面让我们扩展一下 `role: math, cmd: sum` 操作，它只接收整型数字，那么，怎么做？

```javascript
seneca.add({role: 'math', cmd: 'sum', integer: true}, function (msg, respond) {
  var sum = Math.floor(msg.left) + Math.floor(msg.right)
  respond(null, {answer: sum})
})
```

现在，下面这条消息：

```javascript
{role: 'math', cmd: 'sum', left: 1.5, right: 2.5, integer: true}
```

将得到下面这样的结果：

```javascript
{answer: 3}  // == 1 + 2，小数部分已经被移除了
```

代码可在 [sum-integer.js](https://github.com/pantao/getting-started-seneca/blob/master/sum-integer.js) 中查看。

现在，你的两个模式都存在于系统中了，而且还存在交叉部分，那么 `Seneca` 最终会将消息匹配至哪条模式呢？原则是：更多匹配项目被匹配到的优先，被匹配到的属性越多，则优先级越高。

[pattern-priority-testing.js](https://github.com/pantao/getting-started-seneca/blob/master/pattern-priority-testing.js) 可以给我们更加直观的测试：

```javascript
const seneca = require('seneca')()

seneca.add({role: 'math', cmd: 'sum'}, function (msg, respond) {
  var sum = msg.left + msg.right
  respond(null, {answer: sum})
})

// 下面两条消息都匹配 role: math, cmd: sum

seneca.act({role: 'math', cmd: 'sum', left: 1.5, right: 2.5}, console.log)
seneca.act({role: 'math', cmd: 'sum', left: 1.5, right: 2.5, integer: true}, console.log)

setTimeout(() => {
  seneca.add({role: 'math', cmd: 'sum', integer: true}, function (msg, respond) {
    var sum = Math.floor(msg.left) + Math.floor(msg.right)
    respond(null, { answer: sum })
  })

  // 下面这条消息同样匹配 role: math, cmd: sum
  seneca.act({role: 'math', cmd: 'sum', left: 1.5, right: 2.5}, console.log)

  // 但是，也匹配 role:math,cmd:sum,integer:true
  // 但是因为更多属性被匹配到，所以，它的优先级更高
  seneca.act({role: 'math', cmd: 'sum', left: 1.5, right: 2.5, integer: true}, console.log)
}, 100)
```

输出结果应该像下面这样：

```bash
null { answer: 4 }
null { answer: 4 }
null { answer: 4 }
null { answer: 3 }
```

在上面的代码中，因为系统中只存在 `role: math, cmd: sum` 模式，所以，都匹配到它，但是当 100ms 后，我们给系统中添加了一个 `role: math, cmd: sum, integer: true` 模式之后，结果就不一样了，匹配到更多的操作将有更高的优先级。

这种设计，可以让我们的系统可以更加简单的添加新的功能，不管是在开发环境还是在生产环境中，你都可以在不需要修改现有代码的前提下即可更新新的服务，你只需要先好新的服务，然后启动新服务即可。

## 基于模式的代码复用

模式操作还可以调用其它的操作，所以，这样我们可以达到代码复用的需求：

```javascript
const seneca = require('seneca')()

seneca.add('role: math, cmd: sum', function (msg, respond) {
  var sum = msg.left + msg.right
  respond(null, {answer: sum})
})

seneca.add('role: math, cmd: sum, integer: true', function (msg, respond) {
  // 复用 role:math, cmd:sum
  this.act({
    role: 'math',
    cmd: 'sum',
    left: Math.floor(msg.left),
    right: Math.floor(msg.right)
  }, respond)
})

// 匹配 role:math,cmd:sum
seneca.act('role: math, cmd: sum, left: 1.5, right: 2.5',console.log)

// 匹配 role:math,cmd:sum,integer:true
seneca.act('role: math, cmd: sum, left: 1.5, right: 2.5, integer: true', console.log)
```

在上面的示例代码中，我们使用了 `this.act` 而不是前面的 `seneca.act`，那是因为，在 `action` 函数中，上下文关系变量 `this` ，引用了当前的 `seneca` 实例，这样你就可以在任何一个 `action` 函数中，访问到该 `action` 调用的整个上下文。

在上面的代码中，我们使用了 JSON 缩写形式来描述模式与消息， 比如，下面是对象字面量：

```javascript
{role: 'math', cmd: 'sum', left: 1.5, right: 2.5}
```

缩写模式为：

```text
'role: math, cmd: sum, left: 1.5, right: 2.5'
```

[jsonic](https://github.com/rjrodger/jsonic) 这种格式，提供了一种以字符串字面量来表达对象的简便方式，这使得我们可以创建更加简单的模式和消息。

上面的代码保存在了 [sum-reuse.js](https://github.com/pantao/getting-started-seneca/blob/master/sum-reuse.js) 文件中。
