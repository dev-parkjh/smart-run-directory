import { resolve } from 'path'
import process from 'process'
import { findPath, IProjectInfo, printProjects, readPackageJson, readSetting, saveSetting } from './common'

const saveProject = (projectInfo: IProjectInfo) => {
  try {
    const { projects } = readSetting(true)
    const existInfo = projects.findIndex(({ name }: IProjectInfo) => name === projectInfo.name)

    let message: string

    if (existInfo !== -1) {
      projects[existInfo] = projectInfo
      message = '프로젝트 정보가 업데이트 되었습니다.'
    } else {
      projects.push(projectInfo)
      message = '프로젝트 정보가 추가되었습니다.'
    }

    saveSetting(projects)

    console.info('\n' + message)
    printProjects([projectInfo])
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

const add = async(path?: string) => {
  try {
    if (path === undefined) path = await findPath()
    const projectPath = resolve(process.cwd(), path)
    const packageJson = readPackageJson(projectPath)

    saveProject({
      name: packageJson.name,
      path: projectPath,
      version: packageJson.version,
      description: packageJson.description
    })
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default add
