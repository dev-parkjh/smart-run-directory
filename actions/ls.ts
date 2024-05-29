import { printProjects, readSetting } from './common'

const list = () => {
  try {
    const { projects } = readSetting()

    printProjects(projects)
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default list
