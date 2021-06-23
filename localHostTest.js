const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const pathfinder = require('mineflayer-pathfinder').pathfinder

var cropType = 'wheat_seeds'

var seedName = 'wheat_seeds';
var harvestName = 'wheat';

const bot = mineflayer.createBot({
	host: "localhost",
	port: 57461,
	username: "Farmer",
	//viewDistance: "tiny",
});

var chestPosition = vec3(-44, 4, -30);
var mcData;

bot.loadPlugin(pathfinder)

bot.on('kicked', (reason, loggedIn) => console.log(reason, loggedIn));
bot.on('error', err => console.log(err));

bot.once('spawn', ()=>{
	mcData = require('minecraft-data')(bot.version);
	cosmicLooper();
	sayItems();
});

// async function mainLooper(){

// }



async function cosmicLooper() {

	if (bot.inventory.slots.filter(v=>v==null).length < 30) {
		await depositLoop();
	} else await farmLoop();

	setTimeout(cosmicLooper, 20);
}

async function depositLoop() {
	let chestBlock = bot.findBlock({
		matching: mcData.blocksByName['chest'].id,
	});

	let stack = false;

	if (!chestBlock) return;

	if (bot.entity.position.distanceTo(chestBlock.position) < 2) {
		bot.setControlState('forward', false);

		let chest = await bot.openChest(chestBlock);

		for (slot of bot.inventory.slots) {
			if(slot && slot.name == seedName){
				if(stack){
					await chest.deposit(slot.type, null, slot.count);
				}
				stack = true;
			}
			if (slot && slot.name != seedName) {
				await chest.deposit(slot.type, null, slot.count);
			}
		}
		chest.close();
	} else {
		bot.lookAt(chestBlock.position);
		bot.setControlState('forward', true);
	}
}

async function farmLoop() {
	let harvest = readyCrop();

	if (harvest) {
		bot.lookAt(harvest.position);
		try {
			if (bot.entity.position.distanceTo(harvest.position) < 1) {
				bot.setControlState('forward', false);

				await bot.dig(harvest);
				if (!bot.heldItem || bot.heldItem.name != seedName) await bot.equip(mcData.itemsByName[seedName].id);

				let dirt = bot.blockAt(harvest.position.offset(0, -1, 0));
				await bot.placeBlock(dirt, vec3(0, 1, 0));
			} else {
				bot.setControlState('forward', true);
			}
		} catch(err) {
			console.log(err);
		}
	}
}

function readyCrop() {
	return bot.findBlock({
		matching: (blk)=>{
			return(blk.name == harvestName && blk.metadata == 7);
		},
		maxDistance: 64
	});
}

function sayItems (items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if(output){
      console.log(output)
    }else{
      console.log('empty')
    }
  }

  function itemToString (item) {
    if (item) {
      return `${item.name} x ${item.count}`
    } else {
      return '(nothing)'
    }
  }