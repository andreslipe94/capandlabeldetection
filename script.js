
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');


// Chequear la cámara si está habilitada
function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

// Si la cámara es soportada, se añade un evento que el usuario activa cuando
// le da click en 'Habilitar Cámara' ésto lo que hace es llamar la función enableCam
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() no está soportado por tu navegador');
}


// Habilita la vista de cámara web y empieza la detección.
function enableCam(event) {
  // Sólo continua si el modelo está cargado.
  if (!model) {
    return;
  }
  
  // Oculta el botón cuando se presiona
  event.target.classList.add('removed');  
  
  // Obtiene los datos del usuario, sólo habilitado video pero no audio
  const constraints = {
    video: true
  };

  // Activa la webcam.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

var model = true;

models.load('./model_web').then(function (loadedModel) {
  model = loadedModel;
  // muestra la sección demo cuando el modelo está lito
  demosSection.classList.remove('invisible');
});

/*async function loadModel () {
  model = await models.load('./model_web')
  
}*/

var children = [];

function predictWebcam() {

  // Aqui se comienza a detectar un fotograma en la secuencia
    model.detect(video).then(function (predictions) {
    // Elimina cualquier rotulado que hicimos en el marco anterior
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    //ahora recorramos las predicciones y dibujémoslas en la vista en vivo si
    // tienen una alta puntuación de reconocimiento
    for (let n = 0; n < predictions.length; n++) {
      // Si tenemos más del 66% de reconocimiento, estamos seguros de haberlo clasificado correctamente, y se dibuja
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% reconocimiento.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // se Vuelve a llamar a esta función para seguir prediciendo cuando el navegador ya ha cargado
    window.requestAnimationFrame(predictWebcam);
  });
}
