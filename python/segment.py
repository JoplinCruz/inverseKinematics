from pyray import *
import math

class Segment:
    def __init__(self, x, y, length, angle, thickness, color):
        self.x = x
        self.y = y
        self.length = length
        self.angle = angle
        self.thickness = thickness
        self.color = color
        self.radius = thickness * 3
        self.p1 = Vector2(self.x, self.y)
        # self.p2 = None
        self.calcPoint2()
        
    def setPos(self, x, y):
        self.p1 = Vector2(x, y)
        self.calcAngle(self.p1.x, self.p1.y)        # self.angle = math.atan2(y - self.p2.y, x - self.p2.x)
        self.calcPoint2()                           # self.p2 = Vector2(x - self.length * math.cos(self.angle), y - self.length * math.sin(self.angle))
    
    def calcAngle(self, x, y):
        self.angle = math.atan2(y - self.p2.y, x - self.p2.x)
    
    def calcPoint2(self):
        self.p2 = Vector2(self.p1.x - self.length * math.cos(self.angle), self.p1.y - self.length * math.sin(self.angle))
    
    def setInvertPos(self, x, y):
        self.p2 = Vector2(x, y)
        self.calcInvertAngle(self.p2.x, self.p2.y)
        self.calcPoint1()
    
    def calcInvertAngle(self, x, y):
        self.angle = math.atan2(y - self.p1.y, x - self.p1.x)

    def calcPoint1(self):
        self.p1 = Vector2(self.p2.x - self.length * math.cos(self.angle), self.p2.y - self.length * math.sin(self.angle))
    
    def toRight(self, radius):
        return Vector2(radius * math.cos(self.angle + math.pi / 2), radius * math.sin(self.angle + math.pi / 2))

    def toLeft(self, radius):
        return Vector2(radius * math.cos(self.angle - math.pi / 2), radius * math.sin(self.angle - math.pi / 2))
    
    def draw(self):
        draw_line_ex(self.p1, self.p2, self.thickness, self.color)
        draw_circle_lines_v(self.p1, self.radius, (128, 128, 128, 255))
        draw_circle_lines_v(self.p2, self.radius, (128, 128, 128, 255))
        
        rightCorner = self.toRight(self.radius)
        leftCorner = self.toLeft(self.radius)
        pr1 = Vector2(self.p1.x + rightCorner.x, self.p1.y + rightCorner.y)
        pr2 = Vector2(self.p2.x + rightCorner.x, self.p2.y + rightCorner.y)
        pl1 = Vector2(self.p1.x + leftCorner.x, self.p1.y + leftCorner.y)
        pl2 = Vector2(self.p2.x + leftCorner.x, self.p2.y + leftCorner.y)
        
        draw_line_ex(pr1, pr2, self.thickness, (128, 128, 128, 255))
        draw_line_ex(pl1, pl2, self.thickness, (128, 128, 128, 255))
        