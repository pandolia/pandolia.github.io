
var board, tbBoard, infotag, mover, mout;
var ilimit, jlimit,ispace, jspace, wrongBlocks, spaceHtml, ipic;

function init(_ipic, rows, cols) {
    board   = new Array();
    tbBoard = document.getElementById('tbBoard');
    for(var k = tbBoard.rows.length - 1; k >= 0; k--) {
        tbBoard.deleteRow(k);
    }
    infotag = document.getElementById('info');
    mout    = new Function("this.style.background='white'");
    ipic    = _ipic;
    ilimit  = rows-1; jlimit = cols-1; wrongBlocks = 0;

    if (ipic) {
        tbBoard.border = "0";
        tbBoard.cellPadding  = "1";
        tbBoard.cellSpacing  = "0";
        mover   = new Function("this.style.background='green'");
    } else {
        tbBoard.border = "1";
        tbBoard.cellPadding  = "2";
        tbBoard.cellSpacing  = "2";
        mover   = new Function("this.style.background='gray'");
    }

	var bid = 0, i, j, rowi, blk;
	for (i = 0; i <= ilimit; i++) {
		board[i] = new Array();
        rowi = tbBoard.insertRow(i);
		for (j = 0; j <= jlimit; j++) {
			blk               = rowi.insertCell(j);
            blk.innerHTML     = genBlkHtml(++bid);
			blk.onmousedown   =
				new Function("clickBlk("+i.toString()+","+j.toString()+")");
			blk.onmouseover   = mover;
			blk.onmouseout    = mout;
            board[i][j]       = new Object();
			board[i][j]       = blk;
            board[i][j].iDest = i; 
            board[i][j].jDest = j;
		}
	}
	shuffle();    
}

function genBlkHtml(bid) {
    if (ipic) {
        var preload = new Image();
        preload.src = "pic" + ipic + "/pic" + bid + ".jpg";
        return "<img src='pic" + ipic + "/pic" + bid + ".jpg'>";
    } else {
        return bid.toString();
    }
}

function random(limit) {
	return Math.floor(Math.random()*(limit+1));
}

function shuffle() {
    if (!wrongBlocks) {
        ispace=random(ilimit);
        jspace=random(jlimit);
        spaceHtml=board[ispace][jspace].innerHTML;
        board[ispace][jspace].innerHTML=" ";
        board[ispace][jspace].onmouseover=null;
        board[ispace][jspace].onmouseout=null;
        if (ipic) {
            tbBoard.cellPadding  = "1";
        }        
    }
    

    var steps = (ilimit+1)*(jlimit+1)*2;
    while (steps--) {
        var i1, j1, i2, j2;

        while (true) {
            i1 = random(ilimit);
            j1 = random(jlimit);
            if (i1 != ispace || j1 != jspace) {
                break;
            }
        }

        while (true) {
            i2 = random(ilimit);
            j2 = random(jlimit);
            if ( (i2 != ispace || j2 != jspace) &&
                 (i2 != i1 && j2 != j1) ) {
                break;
            }
        }

        swapBlock(i1, j1, i2, j2);
    }

    if (!wrongBlocks) {
        success();
        shuffle();
    };
}

function isRightBlk(i, j) {
    return board[i][j].iDest == i && board[i][j].jDest == j;
}

function swapBlock(i1, j1, i2, j2) {
    wrongBlocks  += isRightBlk(i1, j1) + isRightBlk(i2, j2);

    var tmp = board[i1][j1].iDest;
    board[i1][j1].iDest = board[i2][j2].iDest;
    board[i2][j2].iDest = tmp;

	tmp = board[i1][j1].jDest;
    board[i1][j1].jDest = board[i2][j2].jDest;
    board[i2][j2].jDest = tmp;

	tmp = board[i1][j1].innerHTML;
    board[i1][j1].innerHTML = board[i2][j2].innerHTML;
    board[i2][j2].innerHTML = tmp;

    wrongBlocks  -= isRightBlk(i1, j1) + isRightBlk(i2, j2);
    if (wrongBlocks > 9) {
	    infotag.innerHTML = "Wrong&nbsp;blocks:&nbsp;" + wrongBlocks;
    } else {
        infotag.innerHTML = "Wrong&nbsp;blocks:&nbsp;0" + wrongBlocks;
    }

}

function isMovableBlock(i, j) {
    di = i - ispace, dj = j - jspace;
    if ( di == 0 && (dj == 1 || dj == -1) ) {
        return true;
    } else if ( dj == 0 && (di == 1 || di == -1) ) {
        return true;
    } else {
        return false;
    }
}

function clickBlk(i, j) {
    if (wrongBlocks > 0 && isMovableBlock(i, j)) {
        swapBlock(i, j, ispace, jspace);

		board[ispace][jspace].onmouseover=mover;
		board[ispace][jspace].onmouseout=mout;
		board[i][j].onmouseover=null;
		board[i][j].onmouseout=null;

		board[i][j].style.background="white";

        ispace = i; jspace = j;

		if (wrongBlocks == 0) {
			success();
		}
    }
}

function success() {
    board[ispace][jspace].innerHTML=spaceHtml;
    board[ispace][jspace].onmouseover=mover;
    board[ispace][jspace].onmouseout=mout;
    if (ipic) {
        tbBoard.cellPadding  = "0";
    }
    infotag.innerHTML = "Conglaturations!";
}


function chgPic() {
    ipic++;
    if (ipic==3) {
        ipic=1
    };
    init(ipic, 4, 3);
}


function chgType() {
    if (!ipic) {
        init(1, 4, 3);
    } else {
        init(0, 4, 4);
    }
}
