import { resolve } from 'path'
import fs from 'fs'
import select, { Separator as SelectSeparator } from '@inquirer/select'
import checkbox from '@inquirer/checkbox'
import process from 'process'

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

export const findPath = async() => {
  enum PathType { Current }

  let searching = true
  let searchPath = process.cwd()

  while (searching) {
    const directory = fs.readdirSync(searchPath, { withFileTypes: true }).filter(dir => dir.isDirectory())
    const target = await select<string | PathType>({
      message: `추가할 프로젝트 경로를 선택해 주세요 (${searchPath})`,
      choices: [
        { name: '📁 . (현재 경로 추가)', value: PathType.Current },
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
    } else if (target === PathType.Current) {
      searching = false
    }
  }

  return resolve(searchPath)
}

export const selectProject = async(title: string) => {
  const { projects } = readSetting()

  return checkbox({
    message: title,
    choices: projects.map(({ name }: IProjectInfo, index: number) => ({ name, value: index })),
    loop: false
  })
}
