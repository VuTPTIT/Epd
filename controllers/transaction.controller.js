var db = require('../db');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const Joi = require('joi');

module.exports.view = function(request, response) {
  var isAdmin = db.get("users").value().find(user => user.userId === request.cookies.userId).isAdmin;
  var users = db.get('users').value();
  var books = db.get('books').value();
  var transactions = db.get('transactions').value();
  
  var data = [];
  transactions.map(function (value, index){
    data[index] = {};
    data[index]['transactionId'] = value.transactionId;
    data[index]['userId'] = db
      .get('users')
      .find({ userId: value.userId })
      .value()
      .name;
    data[index]['bookId'] = db
      .get('books')
      .find({ bookId: value.bookId })
      .value()
      .title;
    data[index]['isComplete'] = value.isComplete;
  });
  console.log(data);
  
  if(isAdmin){
  response.render('transactions/index', {
    transactions : data,
    books : books,
    users : users
    });
  };
};

module.exports.search = function (request, response) {
  var q = request.query.q
  var matchedUserId = db
    .get('transactions')
    .value()
    .filter(function(value) {
      return q ? value.transactionId.toLowerCase().indexOf(q.toLowerCase()) !== -1 : true;
    });
    response.render('transactions/search', {
      transactions : matchedUserId,
      bookId : matchedUserId,
      userId : matchedUserId
  });
};

// METHOD POST

module.exports.postCreate = function(request, response) {
  
  db.get('transactions')
    .push({ transactionId : shortid.generate(), userId : request.body.user, bookId: request.body.book })
    .write()
    .id;
  
  response.redirect('/transaction/view');
};

module.exports.isComplete = function(request, response) {
  var errors = [];
  
  // if(!request.params.transactionId){
  //   errors.push('TransactionId không hợp lệ') ;
  // }
  
  var transaction = db
    .get('transactions')
    .find({ transactionId : request.params.transactionId })
    .value();
  // return response.json(transaction);
  if(!transaction) {
    errors.push('Không tìm thấy transaction');
  }
  
  if(errors.length) {
    return response.render('transactions/complete', {
      errors : errors
    });
  }
  
  db.get('transactions')
    .find({ transactionId : request.params.transactionId })
    .assign({ isComplete : true })
    .write()
  return response.redirect('/transaction/view');
};

  // trước tiên thì bạn xem là bạn đang dùng GET, đồng nghĩ với việc là không có req.body
  // thì lấy đâu ra req.body mà chỉ có query hoặc params lấy trên url
  // khi tạo ra 1 Joi.object({}) cái bạn viết trong này tức làm cái yêu cầu
  // nó sẽ ở dạng objec {key : value} đơn giản thôi

  // giả sử như bạn muốn so sánh id thì khi bạn req.params thì  nó như này {id : "ajhdsflkahdf"} kiểu vậy
  // công đoạn validate ở đây thực chất là kiểm tra 2 object có giống nhau không chứ không có gì ghê gớm lắm đâu
  // đấy mình nói xong rồi
  