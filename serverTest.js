const { versions } = require('minecraft-data')
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = require('mineflayer-pathfinder').goals
const GoalFollow = goals.GoalFollow
const Item=require('prismarine-item')('1.13.2')
const delay = require('delay')

const LightBlueConcrete = new Item(518, 0)
const EmeraldBlock = new Item(252, 0)

function createBot () {
  let spawnCounter = 0
  let windowCounter = 0

  const bot = mineflayer.createBot({
    host: 'game3.gc2.pl',
    port: 25565,
    username: 'pomocnik01',
    version: '1.13.2'
  })
  bot.on('error', (err) => console.log(err))
  bot.on('end', createBot)


  bot.once('spawn', () => {
    console.log('--------------------------------------------------------------------')
      //mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
      //const mcData = require('minecraft-data')(bot.version)
  
      //console.log(mcData.blocksByName["light_blue_concrete"])
      //console.log(mcData.blocksByName["emerald_block"])
  
  
      bot.chat('/zaloguj qwert')
      console.log("zalogowano!")
  
      // const movements = new Movements(bot, mcData)
      // bot.pathfinder.setMovements(movements)
      // bot.pathfinder.setGoal(new GoalNear(0, 44, 28, 1))
    })
  
  bot.on('windowClose', (window) => {
    console.log('window closed')
  })
  
  bot.on("windowOpen", window => {
    windowCounter++
    if(windowCounter === 1){
      bot.clickWindow(11, 0, 0)
    }else if(windowCounter === 2){
      bot.clickWindow(12, 0, 0)
    }
    //console.log("Hey! Window opened! Title: " + window.title)
    //console.log(window.slots)
  })
  
  bot.on('spawn', async () => {
    spawnCounter++
    console.log(spawnCounter)
    if(spawnCounter === 2){
      bot.chat('/is home')
      //sayItems()
      await bot.waitForChunksToLoad()
      watchChest()
    }
  })

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

  async function watchChest () {
    const mcData = require('minecraft-data')(bot.version)
    let chestToOpen = bot.findBlock({
      matching: mcData.blocksByName.chest.id,
      maxDistance: 6
    })
    if(!chestToOpen){
      console.log('no chest found')
    }
  const chest = await bot.openChest(chestToOpen)
  sayItems(chest.containerItems())
  chest.on('updateSlot', (slot, oldItem, newItem) => {
    console.log(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  chest.on('close', () => {
    console.log('chest closed')
  })
  }
}

createBot()

//bot.loadPlugin(pathfinder)