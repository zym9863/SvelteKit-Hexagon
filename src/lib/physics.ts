/**
 * 二维向量类,用于表示位置、速度和加速度
 */
export class Vector2 {
	constructor(
		public x: number,
		public y: number
	) {}

	/**
	 * 向量加法
	 */
	add(v: Vector2): Vector2 {
		return new Vector2(this.x + v.x, this.y + v.y);
	}

	/**
	 * 向量减法
	 */
	sub(v: Vector2): Vector2 {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	/**
	 * 标量乘法
	 */
	multiply(scalar: number): Vector2 {
		return new Vector2(this.x * scalar, this.y * scalar);
	}

	/**
	 * 向量点积
	 */
	dot(v: Vector2): number {
		return this.x * v.x + this.y * v.y;
	}

	/**
	 * 获取向量长度
	 */
	length(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	/**
	 * 归一化向量
	 */
	normalize(): Vector2 {
		const len = this.length();
		if (len === 0) return new Vector2(0, 0);
		return new Vector2(this.x / len, this.y / len);
	}

	/**
	 * 旋转向量
	 * @param angle 旋转角度(弧度)
	 */
	rotate(angle: number): Vector2 {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
	}

	/**
	 * 复制向量
	 */
	clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}
}

/**
 * 小球物理对象
 */
export class Ball {
	position: Vector2;
	velocity: Vector2;
	acceleration: Vector2;
	radius: number;
	mass: number;
	restitution: number; // 恢复系数 (0-1, 控制弹性)

	/**
	 * 构造函数
	 * @param x 初始 x 坐标
	 * @param y 初始 y 坐标
	 * @param radius 半径
	 * @param mass 质量
	 * @param restitution 恢复系数 (弹性)
	 */
	constructor(x: number, y: number, radius: number, mass: number = 1, restitution: number = 0.8) {
		this.position = new Vector2(x, y);
		this.velocity = new Vector2(0, 0);
		this.acceleration = new Vector2(0, 0);
		this.radius = radius;
		this.mass = mass;
		this.restitution = restitution;
	}

	/**
	 * 应用力
	 * @param force 力向量
	 */
	applyForce(force: Vector2): void {
		// F = ma, 因此 a = F/m
		const acc = force.multiply(1 / this.mass);
		this.acceleration = this.acceleration.add(acc);
	}

	/**
	 * 应用重力
	 * @param gravity 重力加速度(默认 980 像素/秒²,模拟现实世界)
	 */
	applyGravity(gravity: number = 980): void {
		this.applyForce(new Vector2(0, gravity * this.mass));
	}

	/**
	 * 应用空气摩擦力
	 * @param coefficient 摩擦系数
	 */
	applyFriction(coefficient: number = 0.01): void {
		const friction = this.velocity.multiply(-1).normalize().multiply(coefficient * this.mass);
		this.applyForce(friction);
	}

	/**
	 * 更新物理状态(欧拉积分法)
	 * @param deltaTime 时间步长(秒)
	 */
	update(deltaTime: number): void {
		// 更新速度: v = v + a * dt
		this.velocity = this.velocity.add(this.acceleration.multiply(deltaTime));

		// 更新位置: p = p + v * dt
		this.position = this.position.add(this.velocity.multiply(deltaTime));

		// 重置加速度
		this.acceleration = new Vector2(0, 0);
	}

	/**
	 * 处理与墙壁的碰撞反弹
	 * @param normal 墙壁法向量(已归一化)
	 * @param wallVelocity 墙壁运动速度(用于旋转墙壁)
	 */
	bounceOffWall(normal: Vector2, wallVelocity: Vector2 = new Vector2(0, 0)): void {
		// 计算相对速度
		const relativeVelocity = this.velocity.sub(wallVelocity);

		// 计算法向速度分量
		const normalVelocity = relativeVelocity.dot(normal);

		// 如果小球正在远离墙壁,不处理碰撞
		if (normalVelocity >= 0) return;

		// 计算反弹后的法向速度(考虑恢复系数)
		const rebound = -(1 + this.restitution) * normalVelocity;

		// 应用冲量改变速度
		const impulse = normal.multiply(rebound);
		this.velocity = this.velocity.add(impulse);

		// 将墙壁速度的一部分传递给小球(模拟旋转墙壁的影响)
		this.velocity = this.velocity.add(wallVelocity.multiply(0.5));
	}
}
