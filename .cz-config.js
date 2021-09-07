module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新增产品功能' },
    { value: 'fix', name: 'fix:      修复 bug' },
    { value: 'docs', name: 'docs:     文档的变更' },
    {
      value: 'style',
      name: 'style:    不改变代码功能的变动(如删除空格、格式化、去掉末尾分号等)',
    },
    {
      value: 'refactor',
      name: 'refactor: 重构代码。不包括 bug 修复、功能新增',
    },
    {
      value: 'perf',
      name: 'perf:     性能优化',
    },
    { value: 'test', name: 'test:     添加、修改测试用例' },
    {
      value: 'build',
      name: 'build:    构建流程、外部依赖变更，比如升级 npm 包、修改 webpack 配置',
    },
    { value: 'ci', name: 'ci:       修改了 CI 配置、脚本' },
    {
      value: 'chore',
      name: 'chore:    对构建过程或辅助工具和库的更改,不影响源文件、测试用例的其他操作',
    },
    { value: 'revert', name: 'revert:   回滚 commit' },
  ],
  messages: {
    type: '请确保你的提交遵循了原子提交规范！\n选择你要提交的类型:',
    scope: '\n选择一个 scope (可选):',
    customScope: '请输入自定义的 scope:',
    subject: '填写一个简短精炼的描述语句:\n',
    body: '添加一个更加详细的描述，可以附上新增功能的描述或 bug 链接、截图链接 (可选)。使用 "|" 换行:\n',
    breaking: '列举非兼容性重大的变更 (可选):\n',
    footer: '列举出所有变更的 ISSUES CLOSED  (可选)。 例如.: #31, #34:\n',
    confirmCommit: '确认提交?',
  },
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 100,
}
