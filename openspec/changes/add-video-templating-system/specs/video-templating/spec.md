## ADDED Requirements
### Requirement: 模板化视频生成能力
系统 SHALL 支持基于预定义视频模板和素材，生成视频并管理产物。

#### Scenario: 创建模板与素材
- **WHEN** 管理员在后台创建/更新模板（包含 slug、Remotion 组件名、fps、duration、schema、封面）并上传素材
- **THEN** 系统保存模板与素材信息，可被实例引用

#### Scenario: 创建动画实例并配置参数
- **WHEN** 用户创建动画实例并填写 props、选择模板
- **THEN** 系统将实例状态设为 draft/published，并可触发渲染

#### Scenario: 触发渲染并更新状态
- **WHEN** 渲染服务根据实例加载模板与 props 运行 Remotion
- **THEN** 系统将 renderStatus 依次更新为 waiting/rendering/done（或 failed），并保存生成的视频 URL

#### Scenario: 产物可访问
- **WHEN** 渲染完成
- **THEN** 用户可获取 renderVideo 链接访问生成视频
