from segment import Segment
import math

class Spine:
    def __init__(self, x, y, length, segments, angle, thickness, fixed, color):
        self.x = x
        self.y = y
        self.length = length
        self.segments = segments
        self.angle = angle
        self.thickness = thickness
        self.fixed = fixed
        self.color = color

        self.spine = []
        self.radius = []
        self.positions = []
        self.segLength = round(self.length / self.segments)

        tx = self.x; ty = self.y

        for i in range(self.segments):

            seg = Segment(tx, ty, self.segLength, self.angle, self.thickness, self.color)

            tx = seg.p2.x; ty = seg.p2.y
            self.spine.append(seg)
            self.radius.append((math.sin((i / (self.segments-1)) * math.pi) * (self.length *.013)) + max(self.length * .003, 2))
        
        self.getPositions()

    def setPosition(self, x, y):
        tx = x; ty = y
        for seg in self.spine:
            seg.setPos(tx, ty)
            tx = seg.p2.x; ty = seg.p2.y
        if self.fixed:
            tx = self.x; ty = self.y
            for i in range(self.spine.__len__()-1,-1,-1):
                seg = self.spine[i]
                seg.setInvertPos(tx, ty)
                tx = seg.p1.x; ty = seg.p1.y
    
    def getPositions(self):
        self.positions = [self.spine[0].p1]
        for seg in self.spine:
            self.positions.append(seg.p2)

    def draw(self):
        for seg, radius in zip(self.spine, self.radius):
            seg.radius = radius
            seg.draw()