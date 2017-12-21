import numpy as np
from matplotlib.mlab import PCA

def chunks(l, n):
    n = max(1, n)
    return (l[i:i+n] for i in range(0, len(l), n))

file = open("matrix.txt", "r") 
lines = file.readlines()
size = int(lines[0])

re = []
im = []

for i in range(1, len(lines)):
    line = lines[i]
    words = line.split()

    re.append(int(words[0]))
    im.append(int(words[1]))

re = np.array(re)
im = np.array(im)

z = np.array(re + 1j*im)

matrix = np.array_split(z, size)

[w, v] = np.linalg.eig(np.array(matrix))

print (v)