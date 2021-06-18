const { versions } = require('minecraft-data')
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = require('mineflayer-pathfinder').goals
const GoalFollow = goals.GoalFollow
const Item=require('prismarine-item')('1.13.2')
const delay = require('delay')

var vec3 = require('vec3')

function createBot () {
  let spawnCounter = 0
  let windowCounter = 0

  let mcData = require('minecraft-data')('1.13.2')

  const bot = mineflayer.createBot({
    host: 'game3.gc2.pl',
    port: 25565,
    username: 'pomocnik01',
    version: '1.13.2'
  })
  bot.on('error', (err) => console.log(err))
  bot.on('end', createBot)
  // bot.on('inject_allowed', () => {
  //   const mcData = require('minecraft-data')(bot.version)
  // })

  bot.once('spawn', () => {
    console.log('--------------------------------------------------------------------')
    //mineflayerViewer(bot, { port: 3007, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
    //let mcData = require('minecraft-data')(bot.version)

    bot.chat('/zaloguj qwert')
    console.log("zalogowano!")

    //const movements = new Movements(bot, mcData)
    //bot.pathfinder.setMovements(movements)
    //bot.pathfinder.setGoal(new GoalNear(0, 44, 28, 1))
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
      bot.chat('/is home 3')
      sayItems()
      //await bot.waitForChunksToLoad()
    }
    if(spawnCounter === 3){
      await watchChest()
      await loop()
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
    //const mcData = require('minecraft-data')(bot.version)
    var loc = vec3(-1049, 10, 31151)
    let chestToOpen = bot.findBlock({
      matching: mcData.blocksByName.chest.id,
      point: loc
    })
    if(!chestToOpen){
      console.log('no chest found')
    }
  const chest = await bot.openChest(chestToOpen)
  sayItems(chest.containerItems())
  chest.close()
  chest.on('updateSlot', (slot, oldItem, newItem) => {
    console.log(`chest update: ${itemToString(oldItem)} -> ${itemToString(newItem)} (slot: ${slot})`)
  })
  chest.on('close', () => {
    console.log('chest closed')
  })
  }

  function blockToSow () {
    return bot.findBlock({
      point: bot.entity.position,
      matching: mcData.blocksByName.farmland.id,
      maxDistance: 6,
      useExtraInfo: (block) => {
        const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
        return !blockAbove || blockAbove.type === 0
      }
    })
  }

  function blockToHarvest () {
    return bot.findBlock({
      point: bot.entity.position,
      maxDistance: 6,
      matching: (block) => {
        return block && block.type === mcData.blocksByName.wheat.id && block.metadata === 7
      }
    })
  }

  function locate(){
    const mcData = require('minecraft-data')('1.13.2')
    const movements = new Movements(bot, mcData)

    bot.pathfinder.setMovements(movements)
  }

  async function loop () {
    try{
      while(1){
        const toHarvest = blockToHarvest()
        if(toHarvest){
          await bot.dig(toHarvest)
        }else{
          break
        }
      }
      while(1){
        const toSow = blockToSow()
        if(toSow){
          await bot.equip(mcData.itemsByName.wheat_seeds.id, 'hand')
          await bot.placeBlock(toSow, new vec3(0, 1, 0))
        }else{
          break
        }
      }
    }catch(e){
      console.log(e)
    }

    setTimeout(loop, 1000)
  }
}

createBot()

//bot.loadPlugin(pathfinder)