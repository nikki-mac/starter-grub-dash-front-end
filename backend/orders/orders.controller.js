const path = require("path");

// Use the existing order data
const orders = require(path.resolve("backend/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//middleware
function orderExists(req, res, next) {
  const { orderId } = req.params
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({
    status: 404,
    message: `Order does not exist: ${orderId}.`
  })
}

function orderIdMatches(req, res, next) {
  const { orderId } = req.params
  const { data: { id } = {} } = req.body
  if (orderId === id || !id) {
    res.locals.orderId = orderId;
    next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
  })
}

function orderHasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body
  if (!deliverTo || deliverTo === '') {
    next({
      status: 400,
      message: 'A deliverTo is required.'
    })
  }
  res.locals.deliverTo = deliverTo;
  next();
}

function orderHasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body
  if (!mobileNumber || mobileNumber === "") {
    next({
      status: 400,
      message: 'A mobileNumber is required.'
    })
  }
  res.locals.mobileNumber = mobileNumber;
  next();
}

function orderHasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body
  if (!dishes || dishes.length <= 0) {
    next({
      status: 400,
      message: 'Order must include at least one dish.'
    })
  }
  res.locals.dishes = dishes;
  next();
}

function dishesArrayIsArray(req, res, next) {
    const { data: { dishes } = {} } = req.body
    if (Array.isArray(dishes)) {
      res.locals.dishes = dishes;
      next();
    }
    next({
        status: 400, 
        message: 'dishes must be an array.'
    })
}

function orderHasQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body
  const missingQuantity = dishes.find((dish) => !dish.quantity)
  if (missingQuantity) {
    const index = dishes.indexOf(missingQuantity)
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0.`
    })
  }
  res.locals.dishes = dishes;
  next();
}

function orderQuantityIsInteger(req, res, next) {
  const { data: { dishes } = {} } = req.body
  const notAnInteger = dishes.find((dish) => !Number.isInteger(dish.quantity))
  if(notAnInteger) {
    const index = dishes.indexOf(notAnInteger)
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0.`
    })
  }
  res.locals.dishes = dishes;
  next();
}

function orderHasStatus(req, res, next) {
  const { data: { status } = {} } = req.body
  if (!status) {
    next({
      status: 400,
      message: 'Order status is required.'
    })
  }
  res.locals.status = status;
  next();
}

function orderHasValidStatus(req, res, next) {
  const { data: { status } = {} } = req.body
  if (status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered") {
    res.locals.status = status;
    next();
  }
  next({
    status: 400,
    message: 'Order must have a valid status.'
  })
}

function checkStatusForPending(req, res, next) {
  const order = res.locals.order
  const { status } = order
  if (status !== "pending") {
    next({
      status: 400,
      message: 'Order is pending and cannot be deleted.'
    })
  }
  return next();
}

function checkStatusForDelivered(req, res, next) {
  const order = res.locals.order
  const { status } = order
  if (status === "delivered") {
    next({
      status: 400,
      message: 'Order is delivered and cannot be changed.'
    })
  }
  return next();
}


//http methods
function create(req, res, next) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
  const id = nextId();
  const newOrder = {
    id,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, id, status } = {} } = req.body;
  const newOrder = {
    id: res.locals.order.id,
    deliverTo,
    mobileNumber,
    dishes,
    status,
  };
  orders[orders.indexOf(res.locals.order)] = newOrder;
  res.json({ data: newOrder });
};

function destroy(req, res, next) {
  orders.splice(orders.indexOf(res.locals.order), 1);
  res.status(204).json({ data: [] });
}

function list(req, res, next) {
  res.json({ data: orders })
}

module.exports = {
  create: [
    orderHasDeliverTo,
    orderHasMobileNumber,
    orderHasDishes,
    dishesArrayIsArray,
    orderHasQuantity,
    orderQuantityIsInteger,
    create
  ],
  read: [
    orderExists, 
    read
  ],
  update: [
    orderExists,
    checkStatusForDelivered,
    orderHasDeliverTo,
    orderHasMobileNumber,
    orderHasStatus,
    orderHasValidStatus,
    orderHasDishes,
    dishesArrayIsArray,
    orderHasQuantity,
    orderQuantityIsInteger,
    orderIdMatches,
    update
  ],
  delete: [
    orderExists,
    checkStatusForPending,
    destroy
  ],
   list
}