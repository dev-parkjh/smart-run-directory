import { IProjectInfo, printProjects, readSetting, saveSetting, selectProject } from './common'

const remove = async(projectName?: string) => {
  try {
    const { projects } = readSetting()
    
    const targetIndexList = []

    if (projectName === undefined) {
      targetIndexList.push(...(await selectProject('목록에서 제거할 프로젝트를 모두 선택해 주세요')))
    } else {
      const existInfo = projects.findIndex(({ name }: IProjectInfo) => name === projectName)

      if (existInfo !== -1) targetIndexList.push(existInfo)
    }
    
    if (targetIndexList.length === 0) {
      console.info('\n선택된 프로젝트가 없습니다.')

      return
    }
    
    const removeInfoList: IProjectInfo[] = []
    
    targetIndexList.sort((a, b) => b - a)
    targetIndexList.forEach((index) => {
      removeInfoList.push(...projects.splice(index, 1))
    })
    
    saveSetting(projects)
    
    console.info('\n다음 프로젝트 정보가 제거 되었습니다.')
    printProjects(removeInfoList)
  } catch (e) {
    console.info('\n' + (e as Error).message)
  }
}

export default remove
