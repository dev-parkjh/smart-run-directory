import { IProjectInfo, printProjects, saveSetting } from './common'
import { resolve } from 'path'
import process from 'process'
import fs from 'fs'

const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const isIProjectInfo = (obj: unknown): obj is IProjectInfo => {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  const project = obj as Record<string, unknown>

  return isString(project.name) &&
    isString(project.path) &&
    (project.version === undefined || isString(project.version)) &&
    (project.description === undefined || isString(project.description))
}

const validateProjectArray = (arr: unknown[]): arr is IProjectInfo[] => {
  try {
    return arr.every(isIProjectInfo)
  } catch {
    return false
  }
}

const importProjects = async(file?: string) => {
  try {
    const importFile = resolve(process.cwd(), file ?? 'srd-projects.json')

    if (!fs.existsSync(importFile)) {
      console.info('\n파일이 존재하지 않습니다.\n\n파일 경로를 확인해 주세요.')

      return
    }

    const { projects } = JSON.parse(fs.readFileSync(importFile, 'utf8'))

    if (!validateProjectArray(projects)) {
      console.info('\n올바른 프로젝트 정보가 아닙니다.')

      return
    }

    saveSetting(projects)

    console.info(`\n파일을 성공적으로 불러왔습니다.\n- ${importFile}`)
    printProjects(projects)
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default importProjects
