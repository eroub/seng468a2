const express = require("express");
const path = require('path');
const redis = require("redis");
const jsrender = require("jsrender");

const app = express();
const redisClient = redis.createClient(process.env.REDIS_URL);

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/order/cacheOrder', async (req,res) => {
	const data = req.query;
	const cacheOrder = {...data, date: new Date().getTime()};
	await redisClient.lpush("cacheOrder", JSON.stringify(cacheOrder));
	res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/admin', async (req,res) => {
    // Get cached orders
    await redisClient.lrange("cacheOrder", 0, -1, function(err, items){
        const cacheOrders = items.map((order) => JSON.parse(order));
        // Using JSRender render template with results from cached orders
        var tmpl = jsrender.templates('./admin.html');
        var html = tmpl.render({orders: cacheOrders}); // Render
        res.send(html);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})