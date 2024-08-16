import math

class RealVector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def add(self, vec):
        return RealVector(self.x + vec.x, self.y + vec.y)
    
    def sub(self, vec):
        return RealVector(self.x - vec.x, self.y - vec.y)
    
    def getMag(self, vec):
        return math.sqrt((vec.x - self.x)**2 + (vec.y - self.y)**2)
    
    def angleOf(self, vec):
        x = vec.x - self.x; y = vec.y - self.y
        if (x == 0):
            return 0
        
        angle = math.atan(y / x)

        if (x < 0 and y < 0):
            angle += math.pi
        elif (x < 0):
            angle -= math.pi
        
        return angle
    
    def angle(self, vec):
        return math.atan2(vec.y - self.y, vec.x - self.x)