const canvas = document.getElementById("canvas");
const screen = canvas.getContext("2d");


class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return Vector2(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return Vector2(this.x - vec.x, this.y - vec.y);
    }

    mag(vec) {
        return Math.hypot(vec.x - this.x, vec.y - this.y);
    }

    angle(vec) {
        return Math.atan2(vec.y - this.y, vec.x - this.x);
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

    toRight(radius) {
        return new Vector2(radius * Math.cos(this.angle + Math.PI / 2), radius * Math.sin(this.angle + Math.PI / 2));
    }

    toLeft(radius) {
        return new Vector2(radius * Math.cos(this.angle - Math.PI / 2), radius * Math.sin(this.angle - Math.PI / 2));
    }

    draw() {
        let rightCorner = this.toRight(this.radius),
            leftCorner = this.toLeft(this.radius),
            pr1 = new Vector2(this.p1.x + rightCorner.x, this.p1.y + rightCorner.y),
            pr2 = new Vector2(this.p2.x + rightCorner.x, this.p2.y + rightCorner.y),
            pl1 = new Vector2(this.p1.x + leftCorner.x, this.p1.y + leftCorner.y),
            pl2 = new Vector2(this.p2.x + leftCorner.x, this.p2.y + leftCorner.y);

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
        this.measure = measure;
        this.segments = segments;
        this.angle = angle;
        this.thickness = thickness;
        this.fixed = fixed;
        this.color = color

        this.spine = [];
        this.radius = [];
        this.positions = [];
        this.segmentLength = Math.round(this.measure / this.segments);

        this.makeSpine();
        this.getPositions();
    }

    makeSpine() {
        let tx = this.x,
            ty = this.y;

        for (let i = 0; i < this.segments; i++) {
            let segment = new Segment(tx, ty, this.segmentLength, this.angle, this.thickness, this.color);
            tx = segment.p2.x;
            ty = segment.p2.y;
            this.spine.push(segment);
            this.radius.push((Math.sin((i / (this.segments - 1)) * Math.PI) * (this.measure * 0.013)) + 2);
        }
        this.getPositions();
    }

    setPosition(x, y) {
        let tx = x,
            ty = y;

        for (let i = 0; i < this.spine.length; i++) {
            let segment = this.spine[i];
            segment.setPos(tx, ty);
            tx = segment.p2.x;
            ty = segment.p2.y;
        }

        if (this.fixed) {
            tx = this.x;
            ty = this.y;
            let i = this.spine.length; while (i--) {
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
        for (let i = 0; i < this.spine.length; i++) {
            let segment = this.spine[i];
            segment.radius = this.radius[i];
            segment.draw();
        }
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
        this.spine = new Spine(this.x, this.y, 320, 32, 0, 2, "yellow", this.fixed);

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