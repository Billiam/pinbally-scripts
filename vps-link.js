const openVpsCommand = command.allocate("OpenVpsUrl")

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

mainWindow.on("menuopen", ev => {
  if (ev.id !== "game setup") {
    return
  }

  const gameInfo = gameList.getWheelGame(0) || {}
  if (!gameInfo.vpsId) {
    return
  }

  ev.addMenuItem(
    {
      after: command.ShowFindMediaMenu
    },
    {
      title: "Open spreadsheet",
      stayOpen: true,
      cmd: openVpsCommand
    }
  )
})

mainWindow.on("command", ev => {
  if (ev.id === openVpsCommand) {
    const game = gameList.getWheelGame(0) || {}
    if (!game.vpsId) {
      return
    }

    Shell32.ShellExecuteW(null, 'open', `https://virtual-pinball-spreadsheet.web.app/game/${game.vpsId}`)
  }
})