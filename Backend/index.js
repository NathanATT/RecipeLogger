const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('AWWW Welcome to the Backend Server!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});