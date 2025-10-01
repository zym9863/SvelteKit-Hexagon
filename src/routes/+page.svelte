<script lang="ts">
	import { onMount } from 'svelte';
	import { Ball, Vector2 } from '$lib/physics';
	import { Hexagon } from '$lib/hexagon';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let animationId: number;

	// 画布尺寸
	const WIDTH = 800;
	const HEIGHT = 600;

	// 初始化六边形和小球
	let hexagon: Hexagon;
	let ball: Ball;

	// 时间控制
	let lastTime = 0;

	/**
	 * 初始化场景
	 */
	function initScene() {
		// 创建六边形(中心在画布中央,半径 200,旋转速度 0.5 弧度/秒)
		hexagon = new Hexagon(WIDTH / 2, HEIGHT / 2, 200, 0.5);

		// 创建小球(初始位置在六边形中心,半径 15)
		ball = new Ball(WIDTH / 2, HEIGHT / 2 - 50, 15, 1, 0.75);

		// 给小球一个初始速度
		ball.velocity = new Vector2(150, 0);
	}

	/**
	 * 绘制六边形
	 */
	function drawHexagon() {
		if (!ctx) return;

		const vertices = hexagon.getVertices();

		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (let i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i].x, vertices[i].y);
		}
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * 绘制小球
	 */
	function drawBall() {
		if (!ctx) return;

		ctx.fillStyle = '#ef4444';
		ctx.beginPath();
		ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
		ctx.fill();

		// 绘制速度向量(调试用)
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(ball.position.x, ball.position.y);
		const velocityEnd = ball.position.add(ball.velocity.multiply(0.1));
		ctx.lineTo(velocityEnd.x, velocityEnd.y);
		ctx.stroke();
	}

	/**
	 * 更新物理和渲染
	 */
	function update(currentTime: number) {
		if (!ctx) return;

		// 计算时间步长(秒)
		const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
		lastTime = currentTime;

		// 限制最大时间步长,避免大的跳跃
		const dt = Math.min(deltaTime, 0.016); // 最大 16ms

		// 更新六边形旋转
		hexagon.update(dt);

		// 应用物理力
		ball.applyGravity(500); // 重力加速度 500 像素/秒²
		ball.applyFriction(15); // 空气摩擦系数

		// 更新小球物理状态
		ball.update(dt);

		// 检查碰撞
		const collision = hexagon.checkCollision(ball.position, ball.radius);
		if (collision.collided) {
			// 将小球推出墙壁
			ball.position = ball.position.add(collision.normal.multiply(collision.penetration));

			// 计算碰撞点的墙壁速度
			const wallVelocity = hexagon.getWallVelocity(collision.contactPoint);

			// 处理反弹
			ball.bounceOffWall(collision.normal, wallVelocity);
		}

		// 清空画布
		ctx.fillStyle = '#1e293b';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);

		// 绘制场景
		drawHexagon();
		drawBall();

		// 继续动画循环
		animationId = requestAnimationFrame(update);
	}

	/**
	 * 组件挂载时初始化
	 */
	onMount(() => {
		ctx = canvas.getContext('2d');
		if (!ctx) return;

		initScene();
		animationId = requestAnimationFrame(update);

		// 组件卸载时清理
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div class="container">
	<h1>旋转六边形弹跳模拟</h1>
	<canvas bind:this={canvas} width={WIDTH} height={HEIGHT}></canvas>
	<div class="info">
		<p>小球在旋转的六边形内受重力和摩擦力影响</p>
		<p>绿色箭头表示小球的速度方向</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: #0f172a;
		color: #e2e8f0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	h1 {
		margin-bottom: 1rem;
		font-size: 2rem;
		font-weight: 600;
	}

	canvas {
		border: 2px solid #334155;
		border-radius: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.info {
		margin-top: 1rem;
		text-align: center;
		color: #94a3b8;
		font-size: 0.9rem;
	}

	.info p {
		margin: 0.25rem 0;
	}
</style>
