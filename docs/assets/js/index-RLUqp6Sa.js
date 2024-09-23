import{M as e,c as a,a as t,b as l,d as o,e as n,w as s,C as i,B as r,S as d,D as h,o as m,f as c,n as u,F as p,r as w,g as f,h as y,I as z,R as g,i as x,T as v,j as U,k as S,l as V,m as k}from"./vendor-BOoI9EzF.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver((e=>{for(const t of e)if("childList"===t.type)for(const e of t.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&a(e)})).observe(document,{childList:!0,subtree:!0})}function a(e){if(e.ep)return;e.ep=!0;const a=function(e){const a={};return e.integrity&&(a.integrity=e.integrity),e.referrerPolicy&&(a.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?a.credentials="include":"anonymous"===e.crossOrigin?a.credentials="omit":a.credentials="same-origin",a}(e);fetch(e.href,a)}}();const _={class:"maze"},b={class:"maze-box"},C={key:0,class:"maze-time"},M=["innerHTML"],E=["innerHTML"],L=["innerHTML"],T={class:"loadingTip"},A={class:"button"},D={class:"controls"};k(((e,a)=>{const t=e.__vccOpts||e;for(const[l,o]of a)t[l]=o;return t})({data:()=>({now:0,time:1,show:!1,rows:41,maze:[],width:"40%",start:!1,timing:!1,player:{x:1,y:1},loading:!1,mazeSetUp:{end:"🚩",dark:!1,time:1,rows:41,timing:!1,player:"😃",arrival:"🥰",deadEnd:20,wallColor:"#333333",pathColor:"#EEEEEE",endLocation:"center"},endLocation:"center",hasReachedEnd:!1,countdownValue:0}),computed:{end(){const e=this.rows,a=Math.floor(e/2),t=this.endLocation,l={center:{x:a,y:a},random:null,leftDown:{x:1,y:e-2},rightTop:{x:e-2,y:1},rightDown:{x:e-2,y:e-2}};if("random"===t){const e=[l.leftDown,l.rightTop,l.center,l.rightDown];l.random=e[Math.floor(Math.random()*e.length)]}const o=l[t];if(o){const e=this.maze.find((e=>e.x===o.x&&e.y===o.y));if(e)return e.wall=!1,o}}},mounted(){this.generateMaze(),this.renderingInitialization(window.innerWidth),window.addEventListener("keydown",this.move),window.addEventListener("resize",(e=>this.renderingInitialization(e.target.innerWidth)))},methods:{timerEnds(){this.now=0,this.countdownValue=0,this.loading=!1,this.player={x:1,y:1},this.generateMaze()},renderingInitialization(e){const a=e>750?41:25;this.rows=a,this.width=e>750?"40%":"100%",this.mazeSetUp.rows=a,this.generateMaze()},saveSettings(){this.generateMaze(),this.show=!1,e.success("地图数据设置成功")},generateMaze(){const{time:e,rows:a,dark:t,start:l,timing:o,wallColor:n,pathColor:s,endLocation:i}=this.mazeSetUp;this.now=Date.now(),this.time=e,this.rows=a,this.start=o,this.timing=o,this.endLocation=i,this.countdownValue=this.now+6e4*this.time,this.$nextTick((()=>{const e=document.body,a=document.documentElement.style;a.setProperty("--wallColor",n),a.setProperty("--pathColor",s),t?e.setAttribute("arco-theme","dark"):e.removeAttribute("arco-theme")})),this.maze=Array(this.rows*this.rows).fill().map(((e,a)=>({x:a%this.rows,y:Math.floor(a/this.rows),wall:!0})));this.carveMaze(1,1),this.maze.find((e=>1===e.x&&1===e.y)).wall=!1,this.maze.find((e=>e.x===this.end.x&&e.y===this.end.y)).wall=!1,this.createDeadEnds()},carveMaze(e,a){const t=this.coordinateArray(2);t.sort((()=>Math.random()-.5)),t.forEach((t=>{const l=e+t.x,o=a+t.y;if(l>0&&l<this.rows-1&&o>0&&o<this.rows-1){const n=this.maze.find((e=>e.x===l&&e.y===o));if(n&&n.wall){const s=e+t.x/2,i=a+t.y/2,r=this.maze.find((e=>e.x===s&&e.y===i));r&&(r.wall=!1),n.wall=!1,this.carveMaze(l,o)}}}))},createDeadEnds(){const e=this.maze.filter((e=>!e.wall)),a=Math.floor(e.length*(this.mazeSetUp.deadEnd/100));for(let t=0;t<a;t++){const a=e[Math.floor(Math.random()*e.length)];1===this.getNeighbors(a).filter((e=>!e.wall)).length&&(this.maze.find((e=>e.x===a.x&&e.y===a.y)).wall=!0)}},getCellClass:e=>({cell:!0,wall:e.wall,path:!e.wall}),move(e){const{x:a,y:t}=this.player;let l=a,o=t;switch(e="string"==typeof e?e:e.key){case"w":case"up":case"ArrowUp":t>0&&o--;break;case"s":case"down":case"ArrowDown":t<this.rows-1&&o++;break;case"a":case"left":case"ArrowLeft":a>0&&l--;break;case"d":case"right":case"ArrowRight":a<this.rows-1&&l++;break;default:return}this.maze.find((e=>e.x===l&&e.y===o)).wall||(this.player.x=l,this.player.y=o,this.hasReachedEnd=this.player.x===this.end.x&&this.player.y===this.end.y)},getNeighbors(e){const a=this.coordinateArray(1),t=[];return a.forEach((a=>{const l=e.x+a.x,o=e.y+a.y;if(l>=0&&l<this.rows&&o>=0&&o<this.rows){const e=this.maze.find((e=>e.x===l&&e.y===o));e.wall||t.push(e)}})),t},coordinateArray:e=>[{x:0,y:-e},{x:0,y:e},{x:-e,y:0},{x:e,y:0}]}},[["render",function(e,k,H,R,O,I){const K=i,N=r,P=d,B=f,W=y,j=z,F=g,G=x,$=v,q=U,J=S,Q=h;return m(),a("div",_,[t("div",b,[O.timing?(m(),a("div",C,[(m(),l(K,{format:"倒计时: mm:ss:SSS",onFinish:k[0]||(k[0]=e=>O.loading=!0),start:O.start,key:O.now,value:O.countdownValue,now:O.now},null,8,["start","value","now"]))])):o("",!0),n(P,{loading:O.loading,"hide-icon":""},{tip:s((()=>[t("div",T,[k[21]||(k[21]=t("div",{class:"text"},"倒计时结束! 是否重新开始挑战?",-1)),t("div",A,[n(N,{onClick:k[1]||(k[1]=e=>O.loading=!1)},{default:s((()=>k[19]||(k[19]=[c("取消")]))),_:1}),n(N,{onClick:I.timerEnds,type:"primary"},{default:s((()=>k[20]||(k[20]=[c("确定")]))),_:1},8,["onClick"])])])])),default:s((()=>[t("div",{class:"maze-container",style:u({gridTemplateColumns:`repeat(${O.rows}, 10px)`})},[(m(!0),a(p,null,w(O.maze,((e,t)=>(m(),a("div",{key:t,class:V(I.getCellClass(e))},[O.player.x!==e.x||O.player.y!==e.y||O.hasReachedEnd?o("",!0):(m(),a("span",{key:0,innerHTML:O.mazeSetUp.player},null,8,M)),I.end.x!==e.x||I.end.y!==e.y||O.hasReachedEnd?o("",!0):(m(),a("span",{key:1,innerHTML:O.mazeSetUp.end},null,8,E)),O.hasReachedEnd&&I.end.x===e.x&&I.end.y===e.y?(m(),a("span",{key:2,innerHTML:O.mazeSetUp.arrival},null,8,L)):o("",!0)],2)))),128))],4)])),_:1},8,["loading"]),t("div",D,[n(N,{onClick:k[2]||(k[2]=e=>I.move("up"))},{default:s((()=>k[22]||(k[22]=[c("上"),t("span",{class:"shortcutKeys"},"(W)",-1)]))),_:1}),n(N,{onClick:k[3]||(k[3]=e=>I.move("down"))},{default:s((()=>k[23]||(k[23]=[c("下"),t("span",{class:"shortcutKeys"},"(S)",-1)]))),_:1}),n(N,{onClick:k[4]||(k[4]=e=>I.move("left"))},{default:s((()=>k[24]||(k[24]=[c("左"),t("span",{class:"shortcutKeys"},"(A)",-1)]))),_:1}),n(N,{onClick:k[5]||(k[5]=e=>I.move("right"))},{default:s((()=>k[25]||(k[25]=[c("右"),t("span",{class:"shortcutKeys"},"(D)",-1)]))),_:1}),n(N,{onClick:k[6]||(k[6]=e=>O.show=!0)},{default:s((()=>k[26]||(k[26]=[c("设置")]))),_:1})]),n(Q,{width:O.width,title:"迷宫设置",visible:O.show,onOk:I.saveSettings,onCancel:k[18]||(k[18]=e=>O.show=!1),unmountOnClose:""},{default:s((()=>[n(J,{model:O.mazeSetUp,layout:"vertical"},{default:s((()=>[n(W,{field:"dark",label:"夜间模式",extra:"是否开启夜间模式"},{default:s((()=>[n(B,{modelValue:O.mazeSetUp.dark,"onUpdate:modelValue":k[7]||(k[7]=e=>O.mazeSetUp.dark=e),type:"round"},null,8,["modelValue"])])),_:1}),n(W,{field:"rows",label:"迷宫大小",extra:"迷宫大小必须为单数, 数字越大生成的迷宫就越大"},{default:s((()=>[n(j,{modelValue:O.mazeSetUp.rows,"onUpdate:modelValue":k[8]||(k[8]=e=>O.mazeSetUp.rows=e),placeholder:"迷宫大小"},null,8,["modelValue"])])),_:1}),n(W,{field:"deadEnd",label:"死胡同数量占比",extra:"填写百分比"},{default:s((()=>[n(j,{modelValue:O.mazeSetUp.deadEnd,"onUpdate:modelValue":k[9]||(k[9]=e=>O.mazeSetUp.deadEnd=e),max:100,min:10,placeholder:"死胡同数量占比"},null,8,["modelValue"])])),_:1}),n(W,{field:"endLocation",label:"终点位置",extra:"终点位置默认为中间"},{default:s((()=>[n(G,{modelValue:O.mazeSetUp.endLocation,"onUpdate:modelValue":k[10]||(k[10]=e=>O.mazeSetUp.endLocation=e),type:"button"},{default:s((()=>[n(F,{value:"rightTop"},{default:s((()=>k[27]||(k[27]=[c("右上角")]))),_:1}),n(F,{value:"leftDown"},{default:s((()=>k[28]||(k[28]=[c("左下角")]))),_:1}),n(F,{value:"center"},{default:s((()=>k[29]||(k[29]=[c("中间")]))),_:1}),n(F,{value:"rightDown"},{default:s((()=>k[30]||(k[30]=[c("右下角")]))),_:1}),n(F,{value:"random"},{default:s((()=>k[31]||(k[31]=[c("随机")]))),_:1})])),_:1},8,["modelValue"])])),_:1}),n(W,{field:"player",label:"计时挑战",extra:"是否开启计时挑战"},{default:s((()=>[n(B,{modelValue:O.mazeSetUp.timing,"onUpdate:modelValue":k[11]||(k[11]=e=>O.mazeSetUp.timing=e),type:"round"},null,8,["modelValue"])])),_:1}),n(W,{field:"player",label:"计时时限",extra:"最少1分钟"},{default:s((()=>[n(j,{modelValue:O.mazeSetUp.time,"onUpdate:modelValue":k[12]||(k[12]=e=>O.mazeSetUp.time=e),min:1,placeholder:"最少1分钟"},null,8,["modelValue"])])),_:1}),n(W,{field:"player",label:"玩家图标",extra:"支持填写HTML标签"},{default:s((()=>[n($,{modelValue:O.mazeSetUp.player,"onUpdate:modelValue":k[13]||(k[13]=e=>O.mazeSetUp.player=e),placeholder:"玩家图标"},null,8,["modelValue"])])),_:1}),n(W,{field:"end",label:"终点图标",extra:"支持填写HTML标签"},{default:s((()=>[n($,{modelValue:O.mazeSetUp.end,"onUpdate:modelValue":k[14]||(k[14]=e=>O.mazeSetUp.end=e),placeholder:"终点图标"},null,8,["modelValue"])])),_:1}),n(W,{field:"arrival",label:"抵达终点图标",extra:"支持填写HTML标签"},{default:s((()=>[n($,{modelValue:O.mazeSetUp.arrival,"onUpdate:modelValue":k[15]||(k[15]=e=>O.mazeSetUp.arrival=e),placeholder:"抵达终点图标"},null,8,["modelValue"])])),_:1}),n(W,{field:"wallColor",label:"墙壁颜色",extra:"支持选择16进制和RGB颜色代码"},{default:s((()=>[n(q,{modelValue:O.mazeSetUp.wallColor,"onUpdate:modelValue":k[16]||(k[16]=e=>O.mazeSetUp.wallColor=e),"show-preset":"","show-history":"",showText:""},null,8,["modelValue"])])),_:1}),n(W,{field:"pathColor",label:"路径颜色",extra:"支持选择16进制和RGB颜色代码"},{default:s((()=>[n(q,{modelValue:O.mazeSetUp.pathColor,"onUpdate:modelValue":k[17]||(k[17]=e=>O.mazeSetUp.pathColor=e),"show-preset":"","show-history":"",showText:""},null,8,["modelValue"])])),_:1})])),_:1},8,["model"])])),_:1},8,["width","visible","onOk"])])])}],["__scopeId","data-v-4cb8e0c6"]])).mount("#app");