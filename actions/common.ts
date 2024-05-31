import { resolve } from 'path'
import fs from 'fs'
import select, { Separator as SelectSeparator } from '@inquirer/select'
import checkbox from '@inquirer/checkbox'
import process from 'process'
import { exec, spawn } from 'node:child_process'
import * as os from 'node:os'
import readline from 'readline'

export interface IProjectInfo {
  name: string;
  path: string;
  version?: string;
  description?: string;
}

export const settingPath = resolve(__dirname, '..', 'projects.json')

export const readPackageJson = (projectPath: string) => {
  try {
    const packagePath = resolve(projectPath, 'package.json')

    return JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  } catch {
    throw new Error('프로젝트 정보를 불러올 수 없습니다.')
  }
}

export const saveSetting = (projects: IProjectInfo[]) => {
  projects.sort((a, b) => a.name.localeCompare(b.name))
  fs.writeFileSync(settingPath, JSON.stringify({ projects }))
}

export const readSetting = (allowEmptyResult = false) => {
  try {
    fs.accessSync(settingPath, fs.constants.F_OK)
  } catch {
    fs.writeFileSync(settingPath, JSON.stringify({ projects: [] }))
  }

  const setting = JSON.parse(fs.readFileSync(settingPath, 'utf8'))

  if (!allowEmptyResult && setting.projects.length === 0) {
    throw new Error('프로젝트 정보가 없습니다.\n\nadd/scan 명령어를 사용하여 프로젝트를 추가해 주세요.')
  }

  return setting
}

export const printProjects = (projects: IProjectInfo[]) => {
  const nameLength = Math.max(...projects.map(({ name }: IProjectInfo) => name.length))
  const pathLength = Math.max(...projects.map(({ path }: IProjectInfo) => path.length))

  console.log(`+${'-'.repeat(nameLength + 2)}+${'-'.repeat(pathLength + 2)}+`)
  console.log(`| ${'Name'.padEnd(nameLength)} | ${'Path'.padEnd(pathLength)} |`)
  console.log(`+${'-'.repeat(nameLength + 2)}+${'-'.repeat(pathLength + 2)}+`)
  projects.forEach(({ name, path }: IProjectInfo) => {
    console.log(`| ${name.padEnd(nameLength)} | ${path.padEnd(pathLength)} |`)
  })
  console.log(`+${'-'.repeat(nameLength + 2)}+${'-'.repeat(pathLength + 2)}+`)
}

export const lineTool = {
  clearThisLine: () => {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
  },
  insertBlankLine: () => {
    console.log('')
  }
}

export const findPath = async(message: string) => {
  enum PathType { Current }

  let searching = true
  let searchPath = process.cwd()

  while (searching) {
    const directory = fs.readdirSync(searchPath, { withFileTypes: true }).filter(dir => dir.isDirectory())
    const target = await select<string | PathType>({
      message: `${message} (${searchPath})`,
      choices: [
        { name: '📁 . (현재 경로 선택)', value: PathType.Current },
        { name: '📁 ..', value: '..' },
        ...(directory.length === 0
          ? [new SelectSeparator(' (Empty)')]
          : directory.map(dir => ({
            name: `📂 ${dir.name}`,
            value: dir.name
          }))
        ),
      ],
      loop: false
    })

    if (typeof target === 'string') {
      searchPath = resolve(searchPath, target)
      lineTool.clearThisLine()
    } else if (target === PathType.Current) {
      searching = false
    }
  }

  return resolve(searchPath)
}

export const selectMultiProjects = async(title: string) => {
  const { projects } = readSetting()

  return checkbox({
    message: title,
    choices: projects.map(({ name }: IProjectInfo, index: number) => ({ name, value: index })),
    loop: false
  })
}

export const getProjectPath = async(projectName?: string) => {
  const { projects } = readSetting()

  if (projectName !== undefined) {
    return projects.find(({ name }: IProjectInfo) => name === projectName).path
  }

  const projectIndex = await selectProject()

  return projects[projectIndex].path
}

export const selectProject = async() => {
  const { projects } = readSetting()

  return select<number>({
    message: '프로젝트를 선택해 주세요.',
    choices: projects.map(({ name }: IProjectInfo, index: number) => ({
      name,
      value: index,
    })),
    loop: false
  })
}

export const execPromise = (command: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)

        return
      }

      resolve(stdout)
    })
  })
}

export const executeCommandAsync = (command: string, ...args: string[] ) => {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn(command, args, { stdio: 'inherit', shell: true })
    
    childProcess.on('error', (err) => {
      reject(err)
    })

    childProcess.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
      } else {
        reject(`exitCode: ${code}, signal: ${signal}`)
      }
    })
  })
}

export const isCommandAvailable = async(command: string) => {
  const platform = os.platform()

  try {
    if (platform === 'win32') {
      // Windows -> PowerShell Get-Command
      await execPromise(`powershell -Command "Get-Command ${command} -ErrorAction Stop"`)
    } else {
      // Linux, Mac -> which
      await execPromise(`which ${command}`)
    }

    return true
  } catch {
    return false
  }
}
