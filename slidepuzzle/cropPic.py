# -*- coding: utf-8 -*-
"""
Created on Wed Sep 17 21:11:56 2014

@author: huang_cj2
"""
import sys
from PyQt4 import QtGui

app = QtGui.QApplication(sys.argv)

pxm = QtGui.QPixmap("pic.jpg")

NX = 3
NY = 4

DX = pxm.width() / NX
DY = pxm.height() / NY

id = 1
for i in range(NY):
    for j in range(NX):
        pxm.copy(j*DX, i*DY, DX, DY).save('pic%d.jpg' % id)
        id += 1