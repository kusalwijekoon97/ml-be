// sampleController.js
exports.home = (req, res) => {
  res.send("Hello from the controller!");
};

exports.getItems = (req, res) => {
  res.json({ message: "Get items" });
};

exports.createItem = (req, res) => {};
res.json({ message: "Create item" });
