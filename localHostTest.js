const mineflayer = require('mineflayer');
const vec3 = require('vec3');

const bot = mineflayer.createBot({
	host: "localhost",
	username: "Farmer",
	//viewDistance: "tiny",
});

var bedPosition;
var chestPosition;
var mcData;

bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn));
bot.on('error', err => console.log(err));

async function mainLooper(){

}