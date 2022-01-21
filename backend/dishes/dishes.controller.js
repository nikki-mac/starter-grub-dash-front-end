const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//middleware
function dishExists(req, res, next) {
  const {dishId} = req.params
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (foundDish) {
    res.locals.dish = foundDish
    return next();
  }
  next({
    status: 404,
    message: `Dish id does not exist: ${dishId}.`
  })
}

function dishIdMatches(req, res, next) {
  const { dishId } = req.params
  const { data: { id } = {} } = req.body
  if (dishId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}.`
  })
}

function dishHasName(req, res, next) {
  const { data: { name } = {} } = req.body
  if (!name || name === "") {
    next({
      status: 400,
      message: 'Dish must include a name.'
    })
  }
  res.locals.name = name;
  next();
}

function dishHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body
  if (!description || description === "") {
    next({
      status: 400,
      message: 'Dish must include a description.'
    })
  }
  res.locals.description = description;
  next();
}

function dishHasPrice(req, res, next) {
  const { data: { price } = {} } = req.body
  if (!price || price <= 0) {
    next({
      status: 400,
      message: 'Dish must include a price that is a number greater than 0.'
    })
  }
  res.locals.price = price;
  next();
}

function priceIsInteger(req, res, next) {
  const { data: { price } = {} } = req.body
  if (Number.isInteger(price)) {
    return next();
  }
  next({
    status: 400,
    message: 'The price must be a number.'
  })
}

function dishHasImgUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body
  if (!image_url || image_url === "") {
    next({
      status: 400,
      message: 'Dish must include an image_url'
    })
  }
  res.locals.image_url = image_url;
  next();
}

//http methods
function create(req, res, next) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body
  const id = nextId();
  const newDish = {
    id,
    name,
    description,
    price,
    image_url,
  }
  dishes.push(newDish)
  res.status(201).json({ data: newDish })
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const { data: { name, description, price, image_url, id } = {} } = req.body;
    const newDish = {
      id: res.locals.dish.id,
      name,
      description,
      price,
      image_url,
    };
    dishes[dishes.indexOf(res.locals.dish)] = newDish;
    res.json({ data: newDish });
};

function list(req, res, next) {
  res.json({ data: dishes })
}

module.exports = {
  create: [
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    priceIsInteger,
    dishHasImgUrl,
    create
  ],
  read: [
    dishExists, 
    read
  ],
  update: [
    dishExists,
    dishHasName,
    dishHasDescription,
    dishHasPrice,
    priceIsInteger,
    dishHasImgUrl,
    dishIdMatches,
    update
  ],
  list
}
