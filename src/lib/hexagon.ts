import { Vector2 } from './physics';

/**
 * 线段类,表示六边形的一条边
 */
export class LineSegment {
	constructor(
		public start: Vector2,
		public end: Vector2
	) {}

	/**
	 * 获取线段的法向量(垂直于线段,指向外侧)
	 */
	getNormal(): Vector2 {
		const edge = this.end.sub(this.start);
		// 逆时针旋转 90 度得到外法向量
		return new Vector2(-edge.y, edge.x).normalize();
	}

	/**
	 * 计算点到线段的最短距离
	 */
	distanceToPoint(point: Vector2): number {
		const edge = this.end.sub(this.start);
		const pointToStart = point.sub(this.start);

		const edgeLength = edge.length();
		if (edgeLength === 0) return pointToStart.length();

		// 计算投影比例
		const t = Math.max(0, Math.min(1, pointToStart.dot(edge) / (edgeLength * edgeLength)));

		// 计算最近点
		const closestPoint = this.start.add(edge.multiply(t));
		return point.sub(closestPoint).length();
	}

	/**
	 * 获取线段上离点最近的点
	 */
	getClosestPoint(point: Vector2): Vector2 {
		const edge = this.end.sub(this.start);
		const pointToStart = point.sub(this.start);

		const edgeLength = edge.length();
		if (edgeLength === 0) return this.start.clone();

		const t = Math.max(0, Math.min(1, pointToStart.dot(edge) / (edgeLength * edgeLength)));
		return this.start.add(edge.multiply(t));
	}
}

/**
 * 六边形类
 */
export class Hexagon {
	center: Vector2;
	radius: number; // 中心到顶点的距离
	rotation: number; // 当前旋转角度(弧度)
	rotationSpeed: number; // 旋转速度(弧度/秒)

	/**
	 * 构造函数
	 * @param centerX 中心点 x 坐标
	 * @param centerY 中心点 y 坐标
	 * @param radius 半径
	 * @param rotationSpeed 旋转速度(弧度/秒)
	 */
	constructor(centerX: number, centerY: number, radius: number, rotationSpeed: number = 0.5) {
		this.center = new Vector2(centerX, centerY);
		this.radius = radius;
		this.rotation = 0;
		this.rotationSpeed = rotationSpeed;
	}

	/**
	 * 更新六边形旋转
	 * @param deltaTime 时间步长(秒)
	 */
	update(deltaTime: number): void {
		this.rotation += this.rotationSpeed * deltaTime;
		// 保持在 0-2π 范围内
		if (this.rotation > Math.PI * 2) {
			this.rotation -= Math.PI * 2;
		}
	}

	/**
	 * 获取六边形的顶点坐标
	 */
	getVertices(): Vector2[] {
		const vertices: Vector2[] = [];
		for (let i = 0; i < 6; i++) {
			const angle = (Math.PI / 3) * i + this.rotation; // 每个顶点间隔 60 度
			const x = this.center.x + this.radius * Math.cos(angle);
			const y = this.center.y + this.radius * Math.sin(angle);
			vertices.push(new Vector2(x, y));
		}
		return vertices;
	}

	/**
	 * 获取六边形的边
	 */
	getEdges(): LineSegment[] {
		const vertices = this.getVertices();
		const edges: LineSegment[] = [];
		for (let i = 0; i < 6; i++) {
			const start = vertices[i];
			const end = vertices[(i + 1) % 6];
			edges.push(new LineSegment(start, end));
		}
		return edges;
	}

	/**
	 * 检查小球是否与六边形碰撞
	 * @param ballPosition 小球位置
	 * @param ballRadius 小球半径
	 * @returns 碰撞信息 { collided: boolean, normal: Vector2, penetration: number, contactPoint: Vector2 }
	 */
	checkCollision(ballPosition: Vector2, ballRadius: number): {
		collided: boolean;
		normal: Vector2;
		penetration: number;
		contactPoint: Vector2;
		edge: LineSegment | null;
	} {
		const edges = this.getEdges();
		let minDistance = Infinity;
		let collisionNormal = new Vector2(0, 0);
		let closestEdge: LineSegment | null = null;
		let contactPoint = ballPosition.clone();

		// 检查每条边
		for (const edge of edges) {
			const distance = edge.distanceToPoint(ballPosition);
			if (distance < minDistance) {
				minDistance = distance;
				closestEdge = edge;
				contactPoint = edge.getClosestPoint(ballPosition);
			}
		}

		// 如果距离小于球半径,发生碰撞
		if (minDistance < ballRadius && closestEdge) {
			collisionNormal = closestEdge.getNormal();
			const penetration = ballRadius - minDistance;

			return {
				collided: true,
				normal: collisionNormal,
				penetration,
				contactPoint,
				edge: closestEdge
			};
		}

		return {
			collided: false,
			normal: new Vector2(0, 0),
			penetration: 0,
			contactPoint: ballPosition.clone(),
			edge: null
		};
	}

	/**
	 * 计算边上某点的切向速度(由于六边形旋转产生)
	 * @param point 边上的点
	 */
	getWallVelocity(point: Vector2): Vector2 {
		// 切向速度 = 角速度 × 半径向量的垂直方向
		const radius = point.sub(this.center);
		const tangent = new Vector2(-radius.y, radius.x).normalize();
		const speed = this.rotationSpeed * radius.length();
		return tangent.multiply(speed);
	}
}
