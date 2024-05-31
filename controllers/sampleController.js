// sampleController.js
exports.home = (req, res) => {
    res.send('Hello from the controller!');
};

exports.getItems = (req, res) => {
    // Logic to get items
    res.json({ message: 'Get items' });
};

exports.createItem = (req, res) => {
    // Logic to create an item
    res.json({ message: 'Create item' });
};
