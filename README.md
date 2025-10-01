# SvelteKit-Hexagon

这是一个基于 SvelteKit 的六边形可视化项目，使用 TypeScript 和 Vite 构建。

## 项目结构

- `src/lib/hexagon.ts` - 六边形相关逻辑
- `src/lib/physics.ts` - 物理模拟
- `src/routes/+page.svelte` - 主页面

## 安装依赖

使用 pnpm 安装依赖：

```sh
pnpm install
```

## 开发

启动开发服务器：

```sh
pnpm dev
```

或者启动服务器并在新浏览器标签页中打开应用：

```sh
pnpm dev -- --open
```

## 构建

创建生产版本的应用：

```sh
pnpm build
```

## 预览

预览生产构建：

```sh
pnpm preview
```

## 检查

运行类型检查：

```sh
pnpm check
```

## 部署

要部署应用，您可能需要安装适用于目标环境的 [适配器](https://svelte.dev/docs/kit/adapters)。
