const canvas=document.querySelector('canvas');
const c=canvas.getContext('2d');
canvas.width=innerWidth;
canvas.height=innerHeight-5;
const score=document.getElementById("score");
const scoreend=document.getElementById("scoreend");
const start=document.getElementById("start");
const display=document.getElementById("display");

/*            定義           */

class Player{//玩家
	constructor(x,y,radius,color){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.color=color;
	}
	draw(){
		c.beginPath();
		//x座標,y座標,半徑,起始弧度,結束角度,指定繪圖應該是逆時針還是順時針 默認 False
		c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
		c.fillStyle=this.color;
		/*stroke() 畫出圖形的邊框。
		fill() 填滿路徑內容區域來產生圖形。
		當填滿時，圖形會自動閉合，不過勾勒則不會，所以需要呼叫closePaht()
		*/
		c.fill();
		
	}
}
class Projectile{//發射物
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.color=color;
		this.velocity=velocity;
	}
	draw(){
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
		c.fillStyle=this.color;
		c.fill();
	}	
	update(){
		this.draw();
		this.x=this.x+this.velocity.x;
		this.y=this.y+this.velocity.y;
	}
}
class Enemy{//敵人
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.color=color;
		this.velocity=velocity;
	}
	draw(){
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
		c.fillStyle=this.color;
		c.fill();
	}	
	update(){
		this.draw();
		this.x=this.x+this.velocity.x;
		this.y=this.y+this.velocity.y;
	}
}
class Particle{//爆炸粒子
	constructor(x,y,radius,color,velocity){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.color=color;
		this.velocity=velocity;
		this.alpha=1;
	}
	draw(){
		c.save();
		c.globalAlpha=this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
		c.fillStyle=this.color;
		c.fill();
		c.restore();
	}	
	update(){
		this.draw();
		this.x=this.x+this.velocity.x;
		this.y=this.y+this.velocity.y;
		this.alpha-=0.01;//如果<0 會重新出現
	}
}


let scorenum=0;//分數
const x=canvas.width/2;//玩家位置
const y=canvas.height/2;
let player=new Player(x,y,30,'blue');

let projectiles=[];//發射物陣列
let enemies=[];//敵人陣列
let particles=[];//爆炸粒子陣列

function init(){//初始化
	projectiles=[];//發射物陣列
	enemies=[];//敵人陣列
	particles=[];//爆炸粒子陣列
	player=new Player(x,y,30,'blue');
	scorenum=0;
	score.innerHTML=0;
}

player.draw();

function spawnEnemies(){//產生敵人
	setInterval(()=>{
		
		let enemyspeed=Math.random()*(2-1)+1;//敵人速度*
		if(scorenum>=1000)enemyspeed=Math.random()*(5-2)+2;
		if(scorenum>=3000)enemyspeed=Math.random()*(6-3)+3;
		if(scorenum>=6000)enemyspeed=Math.random()*(7-4)+4;
		const radius=Math.random()*(35-10)+10;
		let x,y;
		if(Math.random()<0.5){
			x=Math.random()<0.5?0-radius:canvas.width+radius;
			y=Math.random()*canvas.width;
		}else{
			x=Math.random()*canvas.height;
			y=Math.random()<0.5?0-radius:canvas.height+radius;
		
		}
		const color=`rgba(${Math.random()*(255-30)+30},
						${Math.random()*(255-30)+30},
						${Math.random()*(255-30)+30},1)`;
		
		const angle=Math.atan2(
		player.y-y,
		player.x-x,
		)
		const velocity={
			x:Math.cos(angle)*enemyspeed,
			y:Math.sin(angle)*enemyspeed
		}

		enemies.push(new Enemy(x,y,radius,color,velocity))//寫入敵人陣列	
	},900)
}


let animateID;

function animate(){//作畫
	animateID=requestAnimationFrame(animate);
	c.fillStyle='rgba(5,5,5,0.2)';
	c.fillRect(0,0,canvas.width,canvas.height);//左上角x座標,左上角y座標,width,hight
	player.draw();
	particles.forEach((particle,index)=>{//更新粒子
		if(particle.alpha<=0){
			particles.splice(index,1);
		}else{
			particle.update();
		}
		
	})
	projectiles.forEach((projectile,index)=>{//更新發射物
		projectile.update();
		//當發射物超出螢幕時刪除
		if(projectile.x+projectile.radius<0||
			projectile.x-projectile.radius>canvas.width||
			projectile.y+projectile.radius<0||
			projectile.y-projectile.radius>canvas.height
			){
			setTimeout(()=>{//從下一幀開始刪除,否則會有閃光
				projectiles.splice(index,1);//從陣列中刪除1個
			},0);
		}
	})

	enemies.forEach((enemy,index)=>{//更新敵人
		enemy.update();
		const dis=Math.hypot(player.x-enemy.x,player.y-enemy.y);
		if(dis-enemy.radius-player.radius<1){//當玩家碰到敵人 
			cancelAnimationFrame(animateID);//結束動畫
			display.style.display='flex';//讓介面顯示
			scoreend.innerHTML=scorenum;
		}

		
		projectiles.forEach((projectile,pindex)=>{
			//平方和的平方根
			const dis=Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y);

			if(dis-enemy.radius-projectile.radius<1){//當敵人碰到發射物

				for(let i=0;i<enemy.radius*2;i++){//爆炸特效
					
						particles.push(new Particle(projectile.x,
						   			projectile.y,Math.random()*2,enemy.color
						  			,{x:(Math.random()-0.5)*Math.random()*7,
						  			y:(Math.random()-0.5)*Math.random()*7}));
					}
				
				//如果敵人半徑大於15 -=15 逐漸縮小	
				if(enemy.radius-15>15){
					scorenum+=100;
					score.innerHTML=scorenum;
					gsap.to(enemy,{radius:enemy.radius-15});//gasp
					setTimeout(()=>{
						projectiles.splice(pindex,1);
					},0);
				}else{
					scorenum+=150;
					score.innerHTML=scorenum;
					setTimeout(()=>{//從下一幀開始刪除,否則會有閃光
					enemies.splice(index,1);//從陣列中刪除1個
					projectiles.splice(pindex,1);
				},0);

				}//else
			}
		})//pro foreach
	})
}//animate

window.addEventListener('click',(event)=>{//監聽器左鍵(發射)

	const angle=Math.atan2(

		event.clientY-player.y,
		event.clientX-player.x,
		)
	
	const velocity={
		x:Math.cos(angle)*6,
		y:Math.sin(angle)*6
	}
	projectiles.push(new Projectile(//寫入發射物陣列
		player.x,
		player.y,
		5,'red',velocity
		))
///


})
/*
window.addEventListener('keydown',(e)=>{//監聽器wasd(移動)
	
	var keyID = e.code;
	if(keyID === 'KeyW')  {
      player.y-=10;
  	}
	else if(keyID === 'KeyA')  {
      player.x-=10;
  	}
  	else if(keyID === 'KeyS')  {
      player.y+=10;
  	}
  	else if(keyID === 'KeyD')  {
      player.x+=10;
  	}    
  	player.x=e.clientX;
	player.y=e.clientY;
})
*/
start.addEventListener('click',()=>{
	display.style.display='none';
	init();
	animate();
	spawnEnemies();
})
