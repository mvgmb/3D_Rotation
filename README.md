# 3D_Rotation
3-axis Rotation of a 3D object

Insert 3 files (listed below) and then define the degree of the rotation to rotate

camera.cfg
/---------------------------------------\
| -200 -50 300                          | ; C - Camera position in World Coordinates
| 0.667 0.172 -1                        | ; Vector N
| 0 3 0                                 | ; Vector V
| 65 0.5 0.6                            | ; d hx hy
|                                       |
\---------------------------------------/

ilumination.txt
/---------------------------------------\
| -200 -50 300                          | ; Pl - Light position in World Coordinates
| 1                                     | ; ka - environment reflection
| 2 2 2                                 | ; Ia - environment color vector
| 1                                     | ; kd - difuse constant
| 1 1 1                                 | ; Od - difuse vector
| 0.5                                   | ; ks - specular constant
| 0 255 0                               | ; Il - light source color
| 2                                     | ; n  - rugosity constant
|                                       |
\---------------------------------------/

objeto.byu                                ; object points in World Coordinates and triangles
/---------------------------------------\
| 3 1                                   | ; 3 points and 1 triangle
| 50.0000 0.0000 0.000                  | ; point 1: P1(50, 0, 0)
| 0 50 0                                | ; point 2: P2(0, 50, 0)
| 0 0 50                                | ; point 3: P3(0, 0, 50)
| 1 2 3                                 | ; triangle 1: consisting of the vertex 1, 2 and 3
|                                       |
\---------------------------------------/
