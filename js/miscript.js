var url = 'http://muestra0.es/';
//var url = 'http://localhost/muestra0/';
var paramsId = '?json=1&include=id,title';
var paramPost = '?json=get_post&post_id=';
var vectorIds = [];
var vectorTitles = [];

function mostrarFecha(datos) {    
    var cadena, dia, mes, anyo, string;
        
    cadena = datos.slice(0,10); // Eliminamos la hora, minutos y segundos
    anyo = datos.substring(0,4);
    mes = datos.substring(5,7);
    string = datos.substring(8,10); // Extraemos el día   
    dia = string.trim();
    if(dia.length < 2) { dia = "0" + dia; } // Si sólo tiene un carácter, le añadimos un cero delante
    return "Publicado el " + dia + "-" + mes + "-" + anyo; // Montamos la fecha correctamente
   
}

function montarImagen(datos) {
    var imagen = '';
    if(jQuery.type(datos.post.attachments[0].images) !== 'array') { // Comprobamos que es un objeto
        if(datos.post.attachments[0].images['post-thumbnail'].width == 604) {
            var url = datos.post.attachments[0].images['post-thumbnail'].url;
                        
            imagen += "<img src='" + url + "' />";            
        }        
    } else { // Si es un array cargamos una imagen por defecto
        imagen += "<img src='img/muestra0.jpg' />";
    }
    return imagen;
}

function montarComentarios(datos) {
    var cadena = "<li class='ui-li-static ui-body-inherit ui-last-child'>";
    
    if(datos == 1) {
        cadena += datos + " comentario</li>";
    } else {
        cadena += datos + " comentarios</li>";
    }
    return cadena;
}

function mostrarContenido(datos) {
    var contenido = '', categoria = '', autor = '', fecha = '', comentarios = '';
    
    if (datos.post.attachments.length > 0) {
        contenido += montarImagen(datos);
    } else {
        contenido += "<img src='img/muestra0.jpg' />"; // Si la entrada no tiene imagen carga una por defecto    
    }
    contenido += "<h1 class='ui-bar ui-bar-c ui-corner-all'>" + datos.post.title + "</h1>";
    contenido += "<div class='ui-body ui-body-c ui-corner-all'>" + datos.post.excerpt + "</div>";
    categoria += "Categoría: " + datos.post.categories[0].title;
    autor += "Escrito por " + datos.post.author.name;
    fecha += mostrarFecha(datos.post.date);
    
    $('#contenidoDinamico').html(contenido);
    $('#detalles li:nth-child(1)').html(categoria);
    $('#detalles li:nth-child(2)').html(autor);
    $('#detalles li:nth-child(3)').html(fecha);
    $('#detalles li:nth-child(4)').remove();
    
    if(datos.post.comment_count > 0) { // Si tiene comentarios, muestra cuantos
        comentarios += montarComentarios(datos.post.comment_count);
        $('#detalles li:nth-child(3)').removeClass('ui-last-child'); // Le quitamos la clase de borde inferior redondeado para que lo tenga el siguiente elemento
        $('#detalles').append(comentarios); // Añadimos el nodo de comentario a la lista desordenada
    }
    
   
    $('#').html(comentarios);
}

function mostrarMensajeError() {
    setTimeout(function() { 
        $.mobile.loading('show',{ // Muestra el widget de carga
            text: '¡Falló la conexión! Comprueba tu conexión a internet y vuelve a intentarlo.',
            textVisible: true,
            textonly: true,
            theme: 'b'
        }); 
    },5);    
}

function mostrarMensajeCarga() {
    setTimeout(function() { 
        $.mobile.loading('show',{ // Muestra el widget de carga
            text: 'Cargando...',
            textVisible: true,
            theme: 'b'
        }); 
    },1);    
}

function obtenerIds() {
    $.ajax({
        url: url + paramsId,
        dataType: 'jsonp',
        type: 'GET',
        contentType: 'text/javascript',
        beforeSend: mostrarMensajeCarga(),
        success: function(data) {            
            $('#subMenu li a').each(function (i) {
                vectorIds.push(data.posts[i].id); // Almacenamos el id de los últimos posts
                $(this).text(data.posts[i].title); // Mostramos el título de cada post en el ancla
            });            
        },
        complete: function() {
            setTimeout(function(){
                $.mobile.loading('hide'); // Ocultamos el widget de carga
            },1);    
        }
    });
}

function obtenerPost(posicionVector) {
    $.ajax({
        url: url + paramPost + vectorIds[posicionVector],
        dataType: 'jsonp',
        timeout: 5000,
        type: 'GET',
        contentType: 'text/javascript',
        beforeSend: mostrarMensajeCarga(),
        success: function(data) {
            mostrarContenido(data);
            $('#contenidoDinamico a').attr('data-ajax','false'); // Añadimos el data-ajax para las páginas fuera de la app
        },
        complete: function() {
            setTimeout(function(){
                $.mobile.loading('hide'); //Ocultamos el widget de carga
            },1);    
        },
        error: function(jqXHR, textStatus, errorThrown) {
            mostrarMensajeError();
        }
    });
}

function anyadirEventos() {
    var arrayElementos = $('#subMenu li a');
        
    arrayElementos.each(function(i){
                    
        $(this).on('click', function(){
            obtenerPost(i);        
        });
    
    });
}

$(document).ready(function() {
    
    obtenerIds();
    obtenerPost(0); 
    anyadirEventos();
    $('nav > ul > li:nth-child(2)').on('click', function() { //Muestra y oculta el submenu de navegación
        $('nav > ul ul').fadeToggle();
    });
});