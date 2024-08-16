import pyray as ray
from spine import Spine

def main():
    ray.init_window(800, 600, "cruzer")
    text = "Inverse Kinematics Constrains"
    width = ray.get_screen_width(); height = ray.get_screen_height()
    fixed = False

    spine = Spine(x=width/2, y=height, length=320, segments=32, angle=0, thickness=1, fixed=False, color=ray.YELLOW)

    while (not ray.window_should_close()):

        if ray.is_key_pressed(ord('F')):
            fixed = True if fixed == False else False
        
        ray.clear_background(ray.DARKGRAY)
        ray.begin_drawing()

        # ray.draw_text(text, round(ray.get_screen_width()/2)-(round(ray.text_length(text)*10/2)), 30, 20, ray.GRAY)
        spine.fixed = fixed
        spine.setPosition(ray.get_mouse_x(), ray.get_mouse_y())
        spine.draw()
    
        ray.end_drawing()
    
    return 0

if __name__ == "__main__":
    main()
