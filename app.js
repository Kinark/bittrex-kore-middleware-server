const express = require('express')
const axios = require('axios')
const storage = require('node-persist');

// Init express
const app = express()

// Listens for GET requests on /koreprice
app.get('/koreprice', async (req, res) => {
   // Init storage
   await storage.init()
   // Gets the last price from DB
   const lastPrice = JSON.parse(await storage.getItem('lastPrice'))
   // Checks if lastPrice from DB exists and if it's not older than 10 seconds
   if (!lastPrice || new Date().getTime() - lastPrice.lastCall >= 10000) {
      // Or it doesn't exist or it's older than 10 seconds
      // Returns a promise with an axios request to bittrex api
      return axios.get('https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-KORE')
         .then(async response => {
            // Define an object with the data (price) and the lastCall (now)
            const lastPrice = {
               data: response.data.result.Last,
               lastCall: new Date().getTime()
            }
            // Stores it in the DB for the next request
            await storage.setItem('lastPrice', JSON.stringify(lastPrice))
            // Sends the response back
            return res.send(lastPrice)
         })
         .catch((error) => {
            console.log(error);
            return res.send('Oops')
         })
   }
   // The lastPrice isn't older than 10 seconds, use the DB's lastPrice instead
   res.send(lastPrice)
})

// Listens to port 1234
app.listen(1234)
