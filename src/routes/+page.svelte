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

		// 绘制发光效果
		ctx.shadowBlur = 20;
		ctx.shadowColor = '#3b82f6';
		
		// 绘制外层光晕
		ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
		ctx.lineWidth = 8;
		ctx.beginPath();
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (let i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i].x, vertices[i].y);
		}
		ctx.closePath();
		ctx.stroke();

		// 绘制主要轮廓
		ctx.strokeStyle = '#3b82f6';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(vertices[0].x, vertices[0].y);
		for (let i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i].x, vertices[i].y);
		}
		ctx.closePath();
		ctx.stroke();

		// 重置阴影
		ctx.shadowBlur = 0;
	}

	/**
	 * 绘制小球
	 */
	function drawBall() {
		if (!ctx) return;

		// 绘制外层光晕
		const gradient = ctx.createRadialGradient(
			ball.position.x, ball.position.y, 0,
			ball.position.x, ball.position.y, ball.radius * 2.5
		);
		gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
		gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
		gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
		
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(ball.position.x, ball.position.y, ball.radius * 2.5, 0, Math.PI * 2);
		ctx.fill();

		// 绘制主体
		const ballGradient = ctx.createRadialGradient(
			ball.position.x - ball.radius * 0.3,
			ball.position.y - ball.radius * 0.3,
			ball.radius * 0.1,
			ball.position.x,
			ball.position.y,
			ball.radius
		);
		ballGradient.addColorStop(0, '#fca5a5');
		ballGradient.addColorStop(0.7, '#ef4444');
		ballGradient.addColorStop(1, '#dc2626');
		
		ctx.shadowBlur = 15;
		ctx.shadowColor = '#ef4444';
		ctx.fillStyle = ballGradient;
		ctx.beginPath();
		ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;

		// 绘制速度向量(调试用) - 增强视觉效果
		const velocityEnd = ball.position.add(ball.velocity.multiply(0.1));
		
		// 绘制模糊的速度轨迹
		ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(ball.position.x, ball.position.y);
		ctx.lineTo(velocityEnd.x, velocityEnd.y);
		ctx.stroke();
		
		// 绘制清晰的速度箭头
		ctx.strokeStyle = '#10b981';
		ctx.lineWidth = 2;
		ctx.shadowBlur = 10;
		ctx.shadowColor = '#10b981';
		ctx.beginPath();
		ctx.moveTo(ball.position.x, ball.position.y);
		ctx.lineTo(velocityEnd.x, velocityEnd.y);
		ctx.stroke();
		ctx.shadowBlur = 0;
		
		// 绘制箭头
		const angle = Math.atan2(velocityEnd.y - ball.position.y, velocityEnd.x - ball.position.x);
		const arrowSize = 8;
		ctx.fillStyle = '#10b981';
		ctx.beginPath();
		ctx.moveTo(velocityEnd.x, velocityEnd.y);
		ctx.lineTo(
			velocityEnd.x - arrowSize * Math.cos(angle - Math.PI / 6),
			velocityEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)
		);
		ctx.lineTo(
			velocityEnd.x - arrowSize * Math.cos(angle + Math.PI / 6),
			velocityEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)
		);
		ctx.closePath();
		ctx.fill();
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

		// 清空画布 - 使用渐变背景
		const bgGradient = ctx.createRadialGradient(
			WIDTH / 2, HEIGHT / 2, 0,
			WIDTH / 2, HEIGHT / 2, Math.max(WIDTH, HEIGHT) / 2
		);
		bgGradient.addColorStop(0, '#1e293b');
		bgGradient.addColorStop(1, '#0f172a');
		ctx.fillStyle = bgGradient;
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
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
		color: #e2e8f0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		position: relative;
		overflow: hidden;
	}

	.container::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
		animation: rotate 20s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	h1 {
		margin-bottom: 2rem;
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
		position: relative;
		z-index: 1;
	}

	canvas {
		border: 2px solid rgba(59, 130, 246, 0.3);
		border-radius: 12px;
		box-shadow: 
			0 0 20px rgba(59, 130, 246, 0.2),
			0 8px 16px rgba(0, 0, 0, 0.4),
			inset 0 0 60px rgba(59, 130, 246, 0.05);
		position: relative;
		z-index: 1;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	canvas:hover {
		transform: scale(1.01);
		box-shadow: 
			0 0 30px rgba(59, 130, 246, 0.4),
			0 12px 24px rgba(0, 0, 0, 0.5),
			inset 0 0 60px rgba(59, 130, 246, 0.08);
	}

	.info {
		margin-top: 2rem;
		text-align: center;
		color: #94a3b8;
		font-size: 0.95rem;
		position: relative;
		z-index: 1;
		line-height: 1.6;
	}

	.info p {
		margin: 0.5rem 0;
		opacity: 0.9;
		transition: opacity 0.3s ease;
	}

	.info p:hover {
		opacity: 1;
		color: #cbd5e1;
	}
</style>
