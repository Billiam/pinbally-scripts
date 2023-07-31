const weeklyData = {
  games: new Map(),
  weeks: [],
  loading: false,
  lastCheck: 0,
  lastWeekEnd: 0
}
const commandPool = new Map()

const tableUrl = id => `https://virtual-pinball-spreadsheet.web.app/game/${id}`
const FILTER_GROUP = "Filter by External List"
const openWeeklyMenuCommand = command.allocate("OpenWeeklyMenu")

const Shell32 = dllImport.bind("Shell32.dll", `
    HINSTANCE ShellExecuteW(
        HWND    hwnd,
        LPCWSTR lpOperation,
        LPCWSTR lpFile,
        LPCWSTR lpParameters,
        LPCWSTR lpDirectory,
        INT     nShowCmd
    );
`);

// create a filter for the weekly competition
const filterId = gameList.createFilter({
  id: 'VPCWeeklyCompetition',
  title: "VPC Weekly Competition",
  group: FILTER_GROUP,
  select: game => game && game.vpsId && weeklyData.games.has(game.vpsId),
  compareForSort: (a, b) => {
    return weeklyData.games.get(b.vpsId).weekNumber - weeklyData.games.get(a.vpsId).weekNumber
  },
  before: () => {
    checkDataReload()
  }
})

mainWindow.on("menuopen", ev => {
  if (ev.id === FILTER_GROUP) {
    ev.addMenuItem(filterId, [
      { title: 'Find VPC Weekly Tables', cmd: openWeeklyMenuCommand, hasSubmenu: true },
      { cmd: -1 },
    ])
  }
});

const allocateWeekCommand = weekNumber => {
  if (!commandPool.has(weekNumber)) {
    commandPool.set(weekNumber, command.allocate(`LoadSpreadsheet-${weekNumber}`))
  }
  return commandPool.get(weekNumber)
}

const truncate = (str, len = 20) => {
  if (str.length > len) {
    return str.substr(0, len - 3) + '...'
  }
  return str
}

const buildWeekMenuItems = () =>
  weeklyData.weeks.filter(week => week.weekNumber != null).map(week => ({
    title: `${week.periodStart} - ${truncate(week.title)}`,
    stayOpen: true,
    cmd: allocateWeekCommand(parseInt(week.weekNumber))
  }))

mainWindow.on("command", ev => {
  if (ev.id === openWeeklyMenuCommand) {
    mainWindow.showMenu("weeklyMenu",
      [
        {
          title: 'Open spreadsheet for previous competition tables',
          cmd: -1
        },
        {
          cmd: -1
        },
        {
          cmd: command.MenuPageUp
        },
        ...buildWeekMenuItems(),
        {
          cmd: command.MenuPageDown
        }
      ],
      {
        dialogStyle: true
      }
    )
  } else if (/^LoadSpreadsheet-\d+$/.test(command.name(ev.id))) {
    const name = command.name(ev.id)
    // find vps id for the week
    const weekNumber = parseInt(name.substring(16))
    const weekData = weeklyData.weeks.find(week => week.weekNumber === weekNumber)
    if (weekData) {
      Shell32.ShellExecuteW(null, 'open', `https://virtual-pinball-spreadsheet.web.app/game/${weekData.vpsId}`)
    }
  }
})

// reload weekly data if we don't have the new week's data, and haven't checked for 30 minutes
const checkDataReload = () => {
  if (weeklyData.loading) {
    return
  }
  const time = Date.now()
  if (time > weeklyData.lastWeekEnd && time - weeklyData.lastCheck > 30*60*1000) {
    loadWeeklyData()
  }
}

const loadWeeklyData = () => {
  const url = 'https://virtualpinballchat.com:6080/api/v1/weeksByChannelName?channelName=competition-corner'
  const request = new HttpRequest()
  weeklyData.loading = true
  weeklyData.lastCheck = Date.now()

  request.open("GET", url, true)
  request.send().then(response => {
    const data = JSON.parse(response)
    const channelData = data.find(channel => channel.channelName === 'competition-corner')
    if (!channelData) {
      logfile.log(`Unable to load competition data from ${url}`)
      return
    }
    let lastPeriodEnd = 0

    const weekData = []

    channelData.weeks.forEach(week => {
      if (week.weekNumber == null) {
        return
      }

      const weekNumber = parseInt(week.weekNumber)

      weekData.push({
        vpsId: week.vpsId,
        weekNumber: weekNumber,
        periodStart: week.periodStart,
        periodEnd: week.periodEnd,
        title: week.table.replace(/(, the)? \(.+\) *$/i, '')
      })

      if (!weeklyData.games.has(week.vpsId) || weeklyData.games.get(week.vpsId).weekNumber < weekNumber) {
        const weekData = {
          weekNumber: weekNumber,
          periodEnd: week.periodEnd,
          vpsId: week.vpsId,
          versionNumber: week.versionNumber,
          authorName: week.authorName,
          romUrl: week.romUrl,
          tableUrl: week.tableUrl,
          b2sUrl: week.b2sUrl
        }
        weeklyData.games.set(week.vpsId, weekData)
      }
      if (week.periodEnd > lastPeriodEnd) {
        lastPeriodEnd = week.periodEnd
      }
    })

    weekData.sort((a, b) => b.weekNumber - a.weekNumber)
    weeklyData.weeks = weekData

    if (lastPeriodEnd) {
      try {
        // weekly competition ends at midnight in pacific timezone
        const parsedDate = Date.parse(`${lastPeriodEnd} 23:59:59 GMT-0700`)
        weeklyData.lastWeekEnd = parsedDate
      } catch (_err) {
        logger.log(`Unable to parse competition end date: ${lastPeriodEnd}`)
      }
    }

    if (gameList.getCurFilter().cmd === filterId) {
      gameList.refreshFilter()
    }
  }).catch(error => {
    console.error(error)
  }).finally(() => {
    weeklyData.loading = false
  })
}

loadWeeklyData()