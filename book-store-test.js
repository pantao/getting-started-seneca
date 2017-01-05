// 使用 Node 内置的 `assert` 模块
const assert = require('assert')

const seneca = require('seneca')()
  .use('basic')
  .use('entity')
  .use('book-store')
  .client({
    port: 9003,
    pin: 'role:store,info:purchase'
  })
  .error(assert.fail);

// 添加一本书
addBook()

function addBook() {
  seneca.act(
    'role:store,add:book,data:{title:Action in Seneca,price:9.99}',
    function(err, savedBook) {

      this.act(
        'role:store,get:book', {
          id: savedBook.id
        },
        function(err, loadedBook) {

          assert.equal(loadedBook.title, savedBook.title)

          purchase(loadedBook);
        }
      )
    }
  )
}

function purchase(book) {
  seneca.act(
    'role:store,cmd:purchase', {
      id: book.id
    },
    function(err, purchase) {
      assert.equal(purchase.bookId, book.id)
    }
  )
}
