# Smart Run Directory
SRD(Smart Run Directory)는 Node.js 프로젝트를 보다 쉽게 실행할 수 있도록 도와주는 CLI 도구입니다.  

## 설치
```bash
npm install -g smart-run-directory
```

## 사용법
```bash
srd [command]
```

## 도움말
```bash
srd --help
```

```text
Usage: srd [options] [command]

Node.js 프로젝트를 보다 쉽게 실행하는 CLI 도구

Options:
  -v, --version                     버전 번호를 출력합니다
  -h, --help                        도움말을 표시합니다

Commands:
  list|ls                           사용할 수 있는 프로젝트 목록을 출력합니다
  add [path]                        목록에 프로젝트를 추가합니다
  remove|rm [project-name]          목록에서 프로젝트를 제거합니다
  scan [path]                       지정된 디렉터리 내의 프로젝트들을 목록에 추가합니다
  open [project-name]               지정한 프로젝트를 에디터에서 표시합니다 (vscode, intellij 지원)
  export [path]                     저장된 프로젝트 목록을 파일로 내보냅니다
  import [file-path]                프로젝트 목록을 파일에서 불러옵니다 (기존 목록은 삭제됨)
  run [project-name] [script-name]  프로젝트의 스크립트를 실행합니다
  update                            CLI 도구를 업데이트 합니다
  help [command]                    명령어에 대한 도움말을 표시합니다
```
- path는 상대 경로 또는 절대 경로 모두 가능합니다.
- project-name은 list에 등록된 프로젝트 이름입니다.
- script-name은 package.json 파일에 등록된 스크립트 이름입니다.

## 예정
- README.md
  - 명령어 사용법 예시 추가
- Commands
  - auto [project-name|script-name] : 현재 디렉터리 기준으로 입력된 파라미터에 더 적합한 명령을 실행합니다.

## 라이선스
흠... 그런건가  
그렇게 된거군  
모르는건가...  
너 역시 때가 되면 알게 될테지



