const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//1 list
function list(req, res) {
  res.json({ data: dishes });
}

//2 post

function isValidDish(req, res, next) {
  const { data: { price } = {} } = req.body;

  const priceInt = price;
  if (typeof priceInt != "number" || priceInt <= 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }

  const requiredFields = ["name", "description", "price", "image_url"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({
        status: 400,
        message: `Dish must include a ${field}`,
      });
    }
  }

  next();
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//3 read
function urlExists(req, res, next) {
  let dishId = req.params.dishId;
  results = dishes.find((dish) => dish.id === dishId);
  if (results) {
    res.locals.found = results;
    return next();
  }

  return next({
    status: 404,
    message: ` not found: ${req.params.dishId}`,
  });
}

function read(req, res, next) {
  res.status(200).json({ data: res.locals.found });
}

// 4 update

function update(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  const result = dishes.find((dish) => dish.id === req.params.dishId);

  if (id && id != req.params.dishId) {
    return next({
      status: 400,
      message: ` id mismatch ${id} `,
    });
  }

  (result.name = name),
    (result.description = description),
    (result.price = price),
    (result.image_url = image_url),
    res.json({ data: result });
}

module.exports = {
  list,
  create: [isValidDish, create],
  read: [urlExists, read],
  update: [urlExists, isValidDish, update],
};
