const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//1 list
function list(req, res) {
  res.json({ data: orders });
}

//2 read
function urlExists(req, res, next) {
  let orderId = req.params.orderId;
  results = orders.find((order) => order.id === orderId);
  if (results) {
    res.locals.found = results;
    return next();
  }

  return next({
    status: 404,
    message: ` not found: ${req.params.orderId}`,
  });
}

function read(req, res, next) {
  res.status(200).json({ data: res.locals.found });
}

// 3 post

function isValidOrder(req, res, next) {
  const requiredFields = ["deliverTo", "mobileNumber", "dishes"]; // few fields to be checked for missing

  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `orders must include a ${field}`,
      });
    }
  }
  const { data: { dishes } = {} } = req.body;

  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: `dishes must be array ${dishes}`,
    });
  }

  dishes.forEach((dish, index) => {
    if (
      typeof dish.quantity != "number" ||
      !dish["quantity"] ||
      dish.quantity === 0
    ) {
      return next({
        status: 400,
        message: `order must have at least 1 quantity can't be 0 or less ....2  ${dishes}`,
      });
    }
  });

  next();
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: "ordered",
    dishes: dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// 4 update

function checkStatus(req, res, next) {
  const { data: { status } = -1 } = req.body;

  if (status === -1 || !status || status === "invalid") {
    return next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  }

  next();
}

function checkNotPending(req, res, next) {
  if (res.locals.found.status !== "pending") {
    return next({
      status: 400,
      message: ` order must be pending `,
    });
  }
  next();
}

function update(req, res, next) {
  const { data: { id, deliverTo, mobileNumber, dishes } = {} } = req.body;

  if (id && id != req.params.orderId) {
    return next({
      status: 400,
      message: ` status id mismatch ${id} `,
    });
  }

  const result = orders.find((order) => order.id === req.params.orderId);
  (result.deliverTo = deliverTo),
    (result.mobileNumber = mobileNumber),
    (result.dishes = dishes),
    res.json({ data: result });
}

function destroy(req, res, next) {
  const orderId = req.params.orderId;

  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);

    return res.sendStatus(204);
  }
  res.sendStatus(405);
}

module.exports = {
  list,
  read: [urlExists, read],
  create: [isValidOrder, create],
  delete: [urlExists, checkNotPending, destroy],
  update: [urlExists, isValidOrder, checkStatus, update],
};
