const canvas = document.getElementById("canvas");
const screen = canvas.getContext("2d");


class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }

    multiply(vec) {
        return new Vector2(this.x * vec.x, this.y * vec.y);
    }

    scale(scale) {
        return new Vector2(this.x * scale, this.y * scale);
    }

    mag(vec) {
        return Math.hypot(vec.x - this.x, vec.y - this.y);
    }

    angle(vec) {
        return Math.atan2(vec.y - this.y, vec.x - this.x);
    }

    delta(vec) {
        return new Vector2(vec.x - this.x, vec.y - this.y);
    }

    normalize() {
        let a = Math.hypot(this.x, this.y);
        let b = this.x / a;
        let c = this.y / a;
        return new Vector2(b, c);
    }
}


class Segment {
    constructor(x, y, measure, angle, thickness, color) {
        this.x = x;
        this.y = y;
        this.measure = measure;
        this.angle = angle;
        this.thickness = thickness;
        this.color = color;
        this.radius = this.thickness * 3;
        this.p1 = new Vector2(this.x, this.y);
        this.p2 = NaN;
        this.calcPoint2();
    }

    setPos(x, y) {
        this.p1 = new Vector2(x, y);
        this.calcAngle(this.p1.x, this.p1.y);
        this.calcPoint2();
    }

    calcAngle(x, y) {
        this.angle = Math.atan2(y - this.p2.y, x - this.p2.x);
    }

    calcPoint2() {
        this.p2 = new Vector2(this.p1.x - this.measure * Math.cos(this.angle), this.p1.y - this.measure * Math.sin(this.angle));
    }

    setInvertPos(x, y) {
        this.p2 = new Vector2(x, y);
        this.calcInvertAngle(this.p2.x, this.p2.y);
        this.calcPoint1();
    }

    calcInvertAngle(x, y) {
        this.angle = Math.atan2(y - this.p1.y, x - this.p1.x);
    }

    calcPoint1() {
        this.p1 = new Vector2(this.p2.x - this.measure * Math.cos(this.angle), this.p2.y - this.measure * Math.sin(this.angle));
    }

    toRight() {
        let delta = this.p1.delta(this.p2);
        let normal = delta.normalize();
        return new Vector2(normal.y, -normal.x);
    }

    toLeft() {
        let delta = this.p1.delta(this.p2);
        let normal = delta.normalize();
        return new Vector2(-normal.y, normal.x);
    }

    draw() {
        let rightCorner = this.toRight().scale(this.radius),
            leftCorner = this.toLeft().scale(this.radius),
            pr1 = rightCorner.add(this.p1)
        pr2 = rightCorner.add(this.p2)
        pl1 = leftCorner.add(this.p1)
        pl2 = leftCorner.add(this.p2)

        screen.strokeStyle = "#77777780";
        screen.lineWidth = 1;
        screen.beginPath();
        screen.arc(this.p1.x, this.p1.y, this.radius, 0, 380);
        screen.arc(this.p2.x, this.p2.y, this.radius, 0, 260);
        screen.moveTo(pr1.x, pr1.y);
        screen.lineTo(pr2.x, pr2.y);
        screen.moveTo(pl1.x, pl1.y);
        screen.lineTo(pl2.x, pl2.y);
        screen.stroke();

        screen.strokeStyle = this.color;
        screen.lineWidth = 2;

        screen.beginPath();
        screen.moveTo(this.p1.x, this.p1.y);
        screen.lineTo(this.p2.x, this.p2.y);
        screen.stroke();
    }
}


class Spine {
    constructor(x, y, measure, segments, angle, thickness, color, fixed = false) {
        this.x = x;
        this.y = y;
        this.segmentLength = measure;
        this.segments = segments;
        this.angle = angle;
        this.thickness = thickness;
        this.fixed = fixed;
        this.color = color

        // this.spine = [];
        // this.radius = [];
        // this.positions = [];
        this.spineLength = this.segmentLength * this.segments;

        this.makeSpine();
        this.makeRadius();
        this.getPositions();
    }

    makeSpine() {
        this.spine = [];

        let tx = this.x,
            ty = this.y;

        for (let i = 0; i < this.segments; i++) {
            let segment = new Segment(tx, ty, this.segmentLength, this.angle, this.thickness, this.color);
            tx = segment.p2.x;
            ty = segment.p2.y;
            this.spine.push(segment);
        }
        this.getPositions();
    }

    makeRadius() {
        this.radius = [];
        for (let i = 0; i <= this.segments; i++) {
            this.radius.push((Math.sin((i / (this.segments - 1)) * Math.PI) * (this.spineLength * 0.013)) + 2)
        }
    }

    angleLimit(thisSegment, nextSegment, radius) {
        let angleLimit = Math.PI / Math.max((radius ** 1.4 / this.segmentLength), 4);

        let angle = nextSegment.angle - thisSegment.angle;


        if (angle < -Math.PI) {
            angle += 2 * Math.PI;
        } else if (angle > Math.PI) {
            angle -= 2 * Math.PI;
        }

        if (angle < -angleLimit || angle > angleLimit) {
            let limit = angle > 0 ? angleLimit : - angleLimit;
            nextSegment.angle = thisSegment.angle + limit

            if (nextSegment.angle < -Math.PI) {
                nextSegment.angle += 2 * Math.PI;
            } else if (nextSegment.angle > Math.PI) {
                nextSegment.angle -= 2 * Math.PI;
            }

            nextSegment.p1 = thisSegment.p2;
            nextSegment.calcPoint2();
        }
    }

    setPosition(x, y) {
        let tx = x,
            ty = y;

        for (let i = 0; i < this.segments; i++) {
            let thisSegment = this.spine[i];
            thisSegment.setPos(tx, ty);

            if (i < this.segments - 1) {
                let nextSegment = this.spine[i + 1];
                nextSegment.setPos(thisSegment.p2.x, thisSegment.p2.y);

                this.angleLimit(thisSegment, nextSegment, this.radius[i]);
            }

            tx = thisSegment.p2.x;
            ty = thisSegment.p2.y;
        }

        if (this.fixed) {
            tx = this.x;
            ty = this.y;
            let i = this.segments;
            while (i--) {
                let segment = this.spine[i];
                segment.setInvertPos(tx, ty);
                tx = segment.p1.x;
                ty = segment.p1.y;
            }
        }
    }

    getPositions() {
        this.positions = [this.spine[0]];
        this.spine.forEach(segment => {
            this.positions.push(segment.p2);
        })
    }

    draw() {
        let points = [];

        for (let i = 0; i < this.segments; i++) {

            let thisSegment = this.spine[i];
            let thisRadius = this.radius[i];
            let nextRadius = this.radius[i + 1];

            let p1 = thisSegment.toLeft().scale(thisRadius).add(thisSegment.p1);
            let p2 = thisSegment.toRight().scale(thisRadius).add(thisSegment.p1);
            let p3 = thisSegment.toRight().scale(nextRadius).add(thisSegment.p2);
            let p4 = thisSegment.toLeft().scale(nextRadius).add(thisSegment.p2);

            if (i == 0) {
                points.push(p1, p2, p3, p4, p1);
            } else {
                points.splice(i + 2, 0, p3, p4);
            }
        }

        screen.strokeStyle = "#ffff00ff";
        screen.fillStyle = "#ff0000ff";
        screen.lineWidth = 2;

        screen.beginPath();
        screen.moveTo(points[0].x, points[0].y);

        points.forEach(point => {
            screen.lineTo(point.x, point.y);
        });

        screen.closePath();
        screen.fill();
        screen.stroke();

        // for (let i = 0; i < this.spine.length; i++) {
        //     let segment = this.spine[i];
        //     segment.radius = this.radius[i];
        //     segment.draw();
        // }
    }
}

class MainIK {
    constructor() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.x = this.width / 2;
        this.y = this.height / 2;
        this.fps = 60;
        this.title = "Inverse Kinematics Constrain";
        this.instruction = "Key <F> fixes the end."
        this.fixed = false;
        this.spine = new Spine(this.x, this.y, 10, 32, 0, 2, "yellow", this.fixed);

        screen.canvas.width = this.width;
        screen.canvas.height = this.height;
    }

    start() {

        document.addEventListener("keydown", (event) => {
            this.keyPush(event);
        });

        document.addEventListener("mousemove", (event) => {
            this.mousePos(event);
            this.drawer();
        });

        document.addEventListener("touchmove", (event) => {
            this.touchMove(event);
            this.drawer();
        });

        window.addEventListener("resize", () => {
            this.resize();
        });

    }

    keyPush(event) {
        if (event.key == "f" || event.key == "F") {
            this.fixed = this.fixed == true ? false : true;
        }
        this.spine.fixed = this.fixed;
    }

    mousePos(event) {
        this.x = event.pageX;
        this.y = event.pageY;
    }

    touchMove(event) {
        let boundingBox = canvas.getBoundingClientRect();
        let root = document.documentElement;
        this.x = parseInt(event.changedTouches[0].clientX);
        this.y = parseInt(event.changedTouches[0].clientY - boundingBox.top - root.scrollTop);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        screen.canvas.width = this.width;
        screen.canvas.height = this.height;
    }

    drawer() {

        screen.clearRect(0, 0, this.width, this.height);

        screen.fillStyle = "#808080";
        screen.font = "regular 20px Iosevka";
        screen.textAlign = "center";
        screen.baseLine = "middle";
        screen.fillText(this.title, this.width / 2, 20);
        screen.fillText(this.instruction, this.width / 2, 40);

        this.spine.setPosition(this.x, this.y);
        this.spine.draw();
    }
}

var inverseKinematic = new MainIK();
inverseKinematic.start();