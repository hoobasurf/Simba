let score=0;

const simba=document.getElementById("simba");

const aliments=document.querySelectorAll(".aliment");

aliments.forEach(aliment=>{

aliment.draggable=true;

aliment.addEventListener("dragstart",e=>{

e.dataTransfer.setData("id","ok");

window.drag=aliment;

});

});

simba.addEventListener("dragover",e=>{

e.preventDefault();

});

simba.addEventListener("drop",e=>{

e.preventDefault();

if(window.drag){

window.drag.remove();

score++;

document.getElementById("points").textContent=score;

if(score==4){

setTimeout(()=>{

alert("Bravo ! Simba est rassasié ! 🦁");

},300);

}

}

});
