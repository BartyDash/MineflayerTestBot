const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow

const bot = mineflayer.createBot({
    host: 'localhost',
    port: 64605,
    username: 'Bot_Testowy'
})

bot.loadPlugin(pathfinder)

function lookAtNearestPlayer(){
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter)

    if(!playerEntity) return

    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    bot.lookAt(pos)
}

bot.on('physicTick', lookAtNearestPlayer)

const welcome = () => {
    bot.chat('Witaj!')
}

function followPlayer() {
    const playerCI = bot.players['HiddenKillerXD']

    if(!playerCI){
        console.log("I can't see CI");
        return
    }

    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    const goal = new GoalFollow(playerCI.entity, 1)
    bot.pathfinder.setGoal(goal, true)
}

bot.once('spawn', welcome)
bot.once('spawn', followPlayer)
