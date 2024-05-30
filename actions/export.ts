import { readSetting } from './common'
import { resolve } from 'path'
import process from 'process'
import fs from 'fs'

const exportProjects = async(path?: string) => {
  try {
    const { projects } = readSetting()
    const exportFile = resolve(process.cwd(), path ?? '.', 'srd-projects.json')

    fs.writeFileSync(exportFile, JSON.stringify({ projects }, null, 2))

    console.info(`\n파일을 성공적으로 내보냈습니다.\n-> ${exportFile}`)
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default exportProjects
