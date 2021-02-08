$(function(){
			class Pixel {
			  constructor(r, g, b, a, x, y) {
			    this.r = r;
			    this.g = g;
			    this.b = b;
			    this.a = a;
			    this.x = x;
			    this.y = y;
			    this.dist = 999999999;
			    this.approx = 999999999;
			    this.closed = false;
			    this.parent = null;
			  }

			  isAdjecent(p){
			  	return (Math.abs(p.x - this.x) <= 1 && Math.abs(p.y - this.y) <= 1)
			  }


			}
			//Canvas setup
			var img = new Image();
			img.onload = function() {
			var canvas = document.getElementById('canvas');
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			var ctx = canvas.getContext('2d');

			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
			var imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
			var  data = imageData.data;
			
			//Pxlarray setup
			var pxlArr = new Array(img.naturalWidth);
			for (var i = pxlArr.length - 1; i >= 0; i--) {
				pxlArr[i] = new Array(img.naturalHeight);
			}
			var clusters = new Array();
			for (var i = 0; i < data.length/4; i++) {
				x =  i%img.naturalWidth;
				y = Math.trunc(i/img.naturalWidth)
				pxlArr[x][y] = new Pixel(data[i*4], data[i*4 + 1], data[i*4 + 2], data[i*4+ 3], x, y);
			}


			//Loop setup
			var weight = 1; //0 = Dijkstra's Algorithm, 1 = Admissable A*, 5 = greedy A*, 100 = Greedy Best-First
			var open = [pxlArr[0][0]];
			var closed = [];
			var path = [];
			var fader = [];
			pxlArr[0][0].dist = 0;
			pxlArr[0][0].approx = (732+437)*weight;
			ctx.fillStyle = "rgba("+255+","+0+","+255+","+(255)+")";
			n = 0;
			var done = true;
			//Letsgo
			function loop(){
				if(done){
				done = false;
				inframeloops = 0;
				while(!done){
					if(inframeloops > 100){
						done = true;
					}
					var curr = open[0];

					//Check if done
					if(n > 1000000 || pxlArr[732][437] == curr){
						window.clearTimeout(loop);
						done = true;
						cursor = pxlArr[732][437];
						$("#output").html("Operations: O(" + n + ")<br>Steps: " + pxlArr[732][437].dist)
						n = 0;
						loop = window.setInterval(loop2, 1);
					}

					var possible = [];
					
					//Up
					if(typeof pxlArr[curr.x][curr.y - 1] === 'undefined'){}
					else if(pxlArr[curr.x][curr.y - 1].g === 255 || pxlArr[curr.x][curr.y - 1].r === 255){
						possible.push(pxlArr[curr.x][curr.y - 1]);	
					}
					//Right
					if(typeof pxlArr[curr.x + 1] === 'undefined'){}
					else if(typeof pxlArr[curr.x + 1][curr.y] === 'undefined'){}
					else if(pxlArr[curr.x + 1][curr.y].g === 255 || pxlArr[curr.x + 1][curr.y].r === 255){
						possible.push(pxlArr[curr.x + 1][curr.y]);	
					}
					//Down
					if(typeof pxlArr[curr.x][curr.y + 1] === 'undefined'){}
					else if(pxlArr[curr.x][curr.y + 1].g === 255 || pxlArr[curr.x][curr.y + 1].r === 255){
						possible.push(pxlArr[curr.x][curr.y + 1]);	
					}
					//Left
					if(typeof pxlArr[curr.x - 1] === 'undefined'){}
					else if(typeof pxlArr[curr.x - 1][curr.y] === 'undefined'){}
					else if(pxlArr[curr.x - 1][curr.y].g === 255 || pxlArr[curr.x - 1][curr.y].r === 255){
						possible.push(pxlArr[curr.x - 1][curr.y]);	
					}


					//Add potentials to open
					for (var i = possible.length - 1; i >= 0; i--) {
						if(possible[i].dist > curr.dist + 1){
							possible[i].dist = curr.dist + 1;
							possible[i].approx = (Math.abs(732 - possible[i].x) + Math.abs(437 - possible[i].y))*weight;
							possible[i].b = 0;
							possible[i].r = 0;
							possible[i].g = 255;
							ctx.fillStyle = "rgba("+255+","+0+","+255+","+(255)+")";
							ctx.fillRect(possible[i].x, possible[i].y, 1, 1);
							fader.push(possible[i]);
							var z = 0;
							while(open[z].dist + open[z].approx < possible[i].dist + possible[i].approx){
								z++;
								if(typeof open[z] === 'undefined'){break;}
							}
							open.splice(z, 0, possible[i]);
							possible[i].parent = curr;
						}
					}

					open.splice(open.indexOf(curr), 1);
					curr.dead = true;
					if(n%(85) === 0){
						fade();
					}
					n++;
					inframeloops++;
				}
				}
			}
			//End of loop
			var cursor;
			loop = window.setInterval(loop, 1); //Start


			//Backtracking
			function loop2(){
				var g =  Math.trunc(255 - 255*(n*3/pxlArr[732][437].dist))
				if(g < -255) g = -g - 255;
				if(g < 0) g = 0;
				var b =  Math.trunc(0 + 255*(n*3/pxlArr[732][437].dist))
				if(b > 255) b = 255*2-b;
				if(b < 0) b = 0;
				var r =  Math.trunc(-255 + 255*(n*3/pxlArr[732][437].dist))
				if(r > 255) r = 255*2-r;
				if(r < 0) r = 0;
				cursor = cursor.parent;
				cursor.r = r;
				cursor.b = b;
				cursor.g = g;
				ctx.fillStyle = "rgba("+r+","+g+","+b+","+(255)+")";
				ctx.fillRect(cursor.x, cursor.y, 1, 1);
				n++;
				if(cursor.dist === 0 || n > 10000){
					window.clearTimeout(loop);
					for (var i = 0; i < data.length/4; i++) {
						x =  i%img.naturalWidth;
						y = Math.trunc(i/img.naturalWidth)
						data[i*4] = pxlArr[x][y].r;
						data[i*4 + 1] = pxlArr[x][y].g;
						data[i*4 + 2] = pxlArr[x][y].b;
						data[i*4 + 3] = pxlArr[x][y].a;
					}
					ctx.putImageData(imageData, 0, 0);
				}
				if(n%5 == 0){
					fade();
				}

			}
			function fade(){
					newfader = [];
					for (var i = 0; i < fader.length; i++) {
						ctx.fillStyle = "rgba("+fader[i].r+","+fader[i].g+","+fader[i].b+","+(255)+")";
						ctx.fillRect(fader[i].x, fader[i].y, 1, 1);

						if(fader[i].r !== 255){
							fader[i].g -= 17;
							fader[i].b += 17;
							fader[i].r += 17;
							newfader.push(fader[i]);
						}
						else{
							fader[i].g = 255;
							fader[i].b = 255;
							fader[i].r = 255;
						}
					}
					fader = [];
					for (var i = 0; i < newfader.length; i++) {
						fader[i] = newfader[i];
					}
			}
			}
			img.src = "maze.png";
		});