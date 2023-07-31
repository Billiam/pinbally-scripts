const Shell32 = dllImport.bind("Shell32.dll", `
  HINSTANCE WINAPI SHGetKnownFolderPath(
    REFIID riid,
    DWORD dwFlags,
    HANDLE hToken,
    LPWSTR *ppszPath);
`)
const Ole32 = dllImport.bind("Ole32.dll", `
  void WINAPI CoTaskMemFree(void *pv);
`)

const roamingAppDataId = '3EB685DB-65F9-4CF6-A03A-E3EF65729F3D'
let appdataPath

const launch3dCommand = command.allocate("Launch3d")

mainWindow.on("menuopen", ev => {
  if (ev.id !== "main") {
    return
  }

  const game = gameList.getWheelGame(0) || { }
  const sys = game.system || { }

  if (/vpinballx[^\\/]*\.exe$/i.test(sys.exe) || sys.systemClass === 'VPX') {
    ev.addMenuItem(
      { after: command.PlayGame },
      { title: "Play - 3D", cmd: launch3dCommand }
    )
  }
})

const getAppdataPath = () => {
  if (!appdataPath) {
    const pathPointer = dllImport.create("LPWSTR")
    Shell32.SHGetKnownFolderPath(roamingAppDataId, 0, null, NativeObject.addressOf(pathPointer))
    appdataPath = pathPointer.value.toStringZ()
    Ole32.CoTaskMemFree(pathPointer.value)
  }
  return appdataPath
}

const isAbsolute = path => path.indexOf(':') > 0

mainWindow.on("command", ev => {
  if (ev.id == launch3dCommand) {
    let iniPath = optionSettings.get('3dLaunchIni', 'VPinballX.3d.ini')
    if (! isAbsolute(iniFilename)) {
      iniPath = `${getAppdataPath()}\\VPinballX\\${iniFilename}`
    }
    const game = gameList.getWheelGame(0) || { }
    const sys = game.system || { }

    mainWindow.playGame(game, {
      command: ev.id,
      overrides: { params: `${sys.params} -Ini ${iniPath}`  }
    })
  }
})