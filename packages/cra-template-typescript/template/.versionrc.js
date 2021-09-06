module.exports = {
  skip: {},
  types: [
    { type: 'feat', section: '新特性' },
    { type: 'fix', section: 'Bug修复' },
    { type: 'docs', section: '文档' },
    { type: 'chore', section: '配置项', hidden: false },
    { type: 'style', section: '格式', hidden: false },
    { type: 'refactor', section: '重构', hidden: false },
    { type: 'perf', section: '性能', hidden: false },
    { type: 'test', section: '测试', hidden: false },
    { type: 'build', section: '构建', hidden: false },
    { type: 'ci', section: 'CI', hidden: false },
    { type: 'revert', section: '回滚', hidden: false },
  ],
}
