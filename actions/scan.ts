import fs from 'fs'
import { IProjectInfo, printProjects, readPackageJson, readSetting, saveSetting } from './common'
import { resolve } from 'path'
import process from 'process'
import checkbox from '@inquirer/checkbox'

const saveProjects = (projectInfoList: IProjectInfo[]) => {
  try {
    const { projects } = readSetting(true)

    const updatedProjects: IProjectInfo[] = []
    const newProjects: IProjectInfo[] = []

    projectInfoList.forEach((projectInfo: IProjectInfo) => {
      const existInfo = projects.findIndex(({ name }: IProjectInfo) => name === projectInfo.name)

      if (existInfo !== -1) {
        updatedProjects.push(projectInfo)
        projects[existInfo] = projectInfo
      } else {
        newProjects.push(projectInfo)
      }
    })

    projects.push(...newProjects)

    saveSetting(projects)

    if (updatedProjects.length !== 0) {
      console.info(`\n프로젝트 정보가 ${updatedProjects.length}건 업데이트 되었습니다.`)
      printProjects(updatedProjects)
    }

    if (newProjects.length !== 0) {
      console.info(`\n프로젝트 정보가 ${newProjects.length}건 추가되었습니다.`)
      printProjects(newProjects)
    }
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

const scan = async(path?: string) => {
  try {
    const scanPath = resolve(process.cwd(), path ?? '.')
    const directory = fs.readdirSync(scanPath, { withFileTypes: true }).filter(dir => dir.isDirectory())
    const projects: IProjectInfo[] = []

    directory.forEach(dir => {
      try {
        const projectPath = resolve(dir.parentPath, dir.name)
        const packageJson = readPackageJson(projectPath)

        projects.push({
          name: packageJson.name,
          path: projectPath,
          version: packageJson.version,
          description: packageJson.description
        })
      } catch {
        // undefined package.json -> pass
      }
    })

    const targetIndexList: number[] = []

    targetIndexList.push(...(
      await checkbox({
        message: '추가할 프로젝트를 모두 선택해 주세요',
        choices: projects.map(({ name }: IProjectInfo, index: number) => ({ name, value: index })),
        loop: false
      })
    ))

    if (targetIndexList.length === 0) {
      console.info('\n선택된 프로젝트가 없습니다.')

      return
    }

    saveProjects(projects.filter((_, index) => targetIndexList.includes(index)))
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default scan
